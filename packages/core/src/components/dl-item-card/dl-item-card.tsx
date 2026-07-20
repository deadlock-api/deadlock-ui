import { Component, Prop, State, Watch, Element, Event, EventEmitter, h } from '@stencil/core';
import { computePosition, flip, shift, offset, autoUpdate, Placement, VirtualElement } from '@floating-ui/dom';
import { Item, ItemCardVariant, ItemClassName, Language, TooltipTrigger } from '../../types';
import { fetchItem, fetchItems } from '../../api/client';
import { ComponentItemInfo } from '../dl-item-tooltip/dl-item-tooltip';
import { configState, onConfigChange } from '../../store/config-store';
import { cardBackground } from '../../utils/assets';
import { injectFonts } from '../../utils/fonts';

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V'];
const AUTO_SIZE_VARIANTS = new Set<ItemCardVariant>(['image-name', 'inline', 'inline-text', 'inline-image']);
const SQUARE_SIZE_VARIANTS = new Set<ItemCardVariant>(['icon', 'image']);

type InlineItemParts = { image: boolean; name: boolean };
type RenderTag = 'div' | 'span';
type ClassMap = { [className: string]: boolean };

@Component({
  tag: 'dl-item-card',
  styleUrl: 'dl-item-card.css',
  shadow: true,
})
export class DlItemCard {
  @Element() el!: HTMLElement;

  /** Item numeric ID. Alternative to `class-name`. */
  @Prop({ attribute: 'item-id' }) itemId?: number;

  /** Item class name (e.g. `"upgrade_clip_size"`). Alternative to `item-id`. */
  @Prop({ attribute: 'class-name' }) itemClassName?: ItemClassName;

  /** Pre-loaded item data object. When provided, skips the API fetch. */
  @Prop({ attribute: 'item-data' }) itemData?: Item;

  /** Hover effect on the card. `"none"` does nothing, `"scale"` enlarges on hover. */
  @Prop({ reflect: true, attribute: 'hover-effect' }) hoverEffect: 'none' | 'scale' = 'none';

  /** Visual variant. `"card"` renders the full shop card; `"image"` renders only the square item image; inline variants render text/image triggers. */
  @Prop({ reflect: true }) variant: ItemCardVariant = 'card';

  /** Show the tier badge on hover. When not set, falls back to the global provider value. */
  @Prop({ attribute: 'show-tier-badge' }) showTierBadge?: boolean;

  /** Resolved component items data. When provided, skips automatic resolution. */
  @Prop() componentItemsData?: ComponentItemInfo[];

  /** Resolved parent items (items this item is a component of). */
  @Prop() parentItemsData?: ComponentItemInfo[];

  /** Override language for the item name only. Tooltip content uses the global language. */
  @Prop({ attribute: 'item-name-language' }) itemNameLanguage?: Language;

  /** Override the tooltip trigger for this card. When not set, falls back to the global provider value. */
  @Prop({ attribute: 'tooltip-trigger' }) tooltipTrigger?: TooltipTrigger;

  /** Emitted when the tooltip opens. Detail contains the item's `class_name`. */
  @Event({ eventName: 'tooltipOpen' }) tooltipOpen!: EventEmitter<string>;

  /** Emitted when the tooltip closes. Detail contains the item's `class_name`. */
  @Event({ eventName: 'tooltipClose' }) tooltipClose!: EventEmitter<string>;

  @State() private _item?: Item;
  @State() private _componentItems?: ComponentItemInfo[];
  @State() private _parentItems?: ComponentItemInfo[];
  @State() private _loading = false;
  @State() private _error?: string;
  @State() private _open = false;
  /** class_name → name in the override language; display names are derived at render time */
  @State() private _nameMap?: Map<string, string>;

  private _hoverTimeout?: ReturnType<typeof setTimeout>;
  private _mouseX = 0;
  private _mouseY = 0;
  private _rafId?: number;
  private _cleanupAutoUpdate?: () => void;
  private _unsubLanguage?: () => void;
  private _tooltipItemsPromise?: Promise<void>;
  private _tooltipItemsResolved = false;

  private get item(): Item | undefined {
    return this.itemData ?? this._item;
  }

  private get cardEl(): HTMLElement | undefined {
    return this.el.shadowRoot?.querySelector('.trigger') as HTMLElement | undefined;
  }

  private get floatingEl(): HTMLElement | undefined {
    return this.el.shadowRoot?.querySelector('.tooltip-wrapper') as HTMLElement | undefined;
  }

  private get virtualRef(): VirtualElement {
    const x = this._mouseX;
    const y = this._mouseY;
    return {
      getBoundingClientRect: () => ({
        x,
        y,
        top: y,
        left: x,
        bottom: y,
        right: x,
        width: 0,
        height: 0,
      }),
    };
  }

  private get resolvedPlacement(): Placement {
    const configured = configState.tooltipPlacement;
    if (configured !== 'auto') return configured as Placement;

    const card = this.cardEl;
    if (!card) return 'right';

    const rect = card.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const spaceRight = vw - rect.right;
    const spaceLeft = rect.left;
    const spaceBottom = vh - rect.bottom;
    const spaceTop = rect.top;

    const maxH = Math.max(spaceRight, spaceLeft);
    const maxV = Math.max(spaceBottom, spaceTop);

    if (maxH >= maxV) {
      return spaceRight >= spaceLeft ? 'right' : 'left';
    }
    return spaceBottom >= spaceTop ? 'bottom' : 'top';
  }

  private get itemKey(): ItemClassName | number | undefined {
    return this.itemId ?? this.itemClassName;
  }

  private get resolvedTrigger(): TooltipTrigger {
    return this.tooltipTrigger ?? configState.tooltipTrigger;
  }

  connectedCallback() {
    injectFonts();
    this.detectCustomTrigger();
    this.updateVariantClasses();
    if (this.itemKey && !this.itemData) {
      this.fetchItemData();
    }
    this.loadNameMap();
    this._unsubLanguage = onConfigChange('language', () => {
      if (this.itemKey && !this.itemData) {
        this.fetchItemData();
      }
      this.loadNameMap();
    });
  }

  private detectCustomTrigger() {
    const hasSlottedContent = this.el.childNodes.length > 0;
    this.el.classList.toggle('custom-trigger', hasSlottedContent);
  }

  private updateVariantClasses() {
    this.el.classList.toggle('variant-auto-size', AUTO_SIZE_VARIANTS.has(this.variant));
    this.el.classList.toggle('variant-square-size', SQUARE_SIZE_VARIANTS.has(this.variant));
  }

  disconnectedCallback() {
    this.hideTooltip();
    this.el.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('click', this._onOutsideClick);
    this._unsubLanguage?.();
  }

  @Watch('itemId')
  @Watch('itemClassName')
  itemKeyChanged() {
    if (this.itemKey && !this.itemData) {
      this.fetchItemData();
    }
  }

  @Watch('itemNameLanguage')
  onItemNameLanguageChange() {
    this._componentItems = undefined;
    this._parentItems = undefined;
    this._tooltipItemsResolved = false;
    this._tooltipItemsPromise = undefined;
    this.loadNameMap();
  }

  @Watch('itemData')
  onItemDataChange() {
    this._componentItems = undefined;
    this._parentItems = undefined;
    this._tooltipItemsResolved = false;
    this._tooltipItemsPromise = undefined;
  }

  @Watch('variant')
  onVariantChange() {
    this.updateVariantClasses();
  }

  private async fetchItemData() {
    const key = this.itemKey;
    if (!key) return;
    this._loading = true;
    this._error = undefined;
    this._componentItems = undefined;
    this._parentItems = undefined;
    this._tooltipItemsResolved = false;
    this._tooltipItemsPromise = undefined;
    try {
      this._item = await fetchItem(key, configState.language);
    } catch (e) {
      this._item = undefined;
      this._error = e instanceof Error ? e.message : 'Failed to load item';
    } finally {
      this._loading = false;
    }
  }

  private async resolveComponentItems() {
    const item = this.item;
    if (!item?.component_items?.length || this.componentItemsData) return;

    try {
      const [allItems] = await Promise.all([
        fetchItems(configState.language),
        this.loadNameMap(),
      ]);
      const byClassName = new Map<string, Item>(allItems.map(i => [i.class_name, i]));

      const resolved: ComponentItemInfo[] = [];
      for (const cn of item.component_items) {
        const comp = byClassName.get(cn);
        if (!comp) continue;
        resolved.push({
          name: this.getNameOverride(comp) ?? comp.name,
          image: this.getImageSrc(comp),
        });
      }
      this._componentItems = resolved;
    } catch {
      // silently fail
    }
  }

  private async resolveParentItems() {
    const item = this.item;
    if (!item || this.parentItemsData) return;

    try {
      const [allItems] = await Promise.all([
        fetchItems(configState.language),
        this.loadNameMap(),
      ]);

      const parents: ComponentItemInfo[] = [];
      for (const other of allItems) {
        if (other.component_items?.includes(item.class_name)) {
          parents.push({
            name: this.getNameOverride(other) ?? other.name,
            image: this.getImageSrc(other),
          });
        }
      }
      this._parentItems = parents.length > 0 ? parents : undefined;
    } catch {
      // silently fail
    }
  }

  private async ensureTooltipItemsResolved() {
    if (this.resolvedTrigger === 'none' || this._tooltipItemsResolved || this._tooltipItemsPromise) return;
    if (!this.item) return;

    this._tooltipItemsPromise = Promise.all([
      this.resolveComponentItems(),
      this.resolveParentItems(),
    ]).then(() => {
      this._tooltipItemsResolved = true;
    }).finally(() => {
      this._tooltipItemsPromise = undefined;
    });

    await this._tooltipItemsPromise;
  }

  private async loadNameMap() {
    const lang = this.itemNameLanguage;
    if (!lang || lang === configState.language) {
      this._nameMap = undefined;
      return;
    }
    try {
      const items = await fetchItems(lang);
      if (lang !== this.itemNameLanguage) return; // stale response for a previous language
      this._nameMap = new Map(items.map(i => [i.class_name, i.name]));
    } catch {
      // silently fail — fall back to default names
    }
  }

  private getNameOverride(item: Item): string | undefined {
    return this._nameMap?.get(item.class_name);
  }

  private get displayName(): string {
    const item = this.item;
    if (!item) return '';
    return this.getNameOverride(item) ?? item.name;
  }

  private computeFloatingPosition(reference: Element | VirtualElement) {
    const floating = this.floatingEl;
    if (!floating) return;

    const placement = this.resolvedPlacement;

    computePosition(reference, floating, {
      placement,
      strategy: 'fixed',
      middleware: [
        offset(8),
        flip({ fallbackStrategy: 'initialPlacement' }),
        shift({ padding: 8 }),
      ],
    }).then(({ x, y, placement: finalPlacement }) => {
      Object.assign(floating.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
      floating.setAttribute('data-placement', finalPlacement);
    });
  }

  /** Follow-cursor mode: position relative to cursor via virtual element */
  private updatePositionFromMouse = () => {
    this.computeFloatingPosition(this.virtualRef);
  };

  /** Anchored mode: position relative to card element */
  private updatePositionFromCard = () => {
    const card = this.cardEl;
    if (!card) return;
    this.computeFloatingPosition(card);
  };

  private handleMouseMove = (e: MouseEvent) => {
    this._mouseX = e.clientX;
    this._mouseY = e.clientY;
    if (this._rafId == null) {
      this._rafId = requestAnimationFrame(() => {
        this._rafId = undefined;
        this.updatePositionFromMouse();
      });
    }
  };

  private showFollowCursorMode() {
    this._open = true;
    this.emitTooltipOpen();
    void this.ensureTooltipItemsResolved();
    requestAnimationFrame(() => this.updatePositionFromMouse());
  }

  private showAnchoredMode() {
    this._open = true;
    this.emitTooltipOpen();
    void this.ensureTooltipItemsResolved();

    requestAnimationFrame(() => {
      const card = this.cardEl;
      const floating = this.floatingEl;
      if (!card || !floating || !this._open) return;

      this.updatePositionFromCard();
      this._cleanupAutoUpdate = autoUpdate(card, floating, this.updatePositionFromCard);
    });
  }

  private hideTooltip() {
    const wasOpen = this._open;
    this._open = false;
    clearTimeout(this._hoverTimeout);
    if (this._rafId != null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = undefined;
    }
    this._cleanupAutoUpdate?.();
    this._cleanupAutoUpdate = undefined;
    if (wasOpen) {
      this.tooltipClose.emit(this.item?.class_name);
    }
  }

  private emitTooltipOpen() {
    const item = this.item;
    if (item) {
      this.tooltipOpen.emit(item.class_name);
    }
  }

  private handleMouseEnter = (e: MouseEvent) => {
    if (this.resolvedTrigger !== 'hover') return;

    const delay = configState.tooltipDelay;

    if (configState.tooltipFollowCursor) {
      this._mouseX = e.clientX;
      this._mouseY = e.clientY;
      this.el.addEventListener('mousemove', this.handleMouseMove);
      if (delay > 0) {
        this._hoverTimeout = setTimeout(() => this.showFollowCursorMode(), delay);
      } else {
        this.showFollowCursorMode();
      }
    } else {
      if (delay > 0) {
        this._hoverTimeout = setTimeout(() => this.showAnchoredMode(), delay);
      } else {
        this.showAnchoredMode();
      }
    }
  };

  private handleMouseLeave = () => {
    if (this.resolvedTrigger !== 'hover') return;
    if (configState.tooltipFollowCursor) {
      this.el.removeEventListener('mousemove', this.handleMouseMove);
    }
    this.hideTooltip();
  };

  private handleCardClick = () => {
    if (this.resolvedTrigger !== 'click') return;
    if (this._open) {
      this.hideTooltip();
      document.removeEventListener('click', this._onOutsideClick);
    } else {
      this.showAnchoredMode();
      requestAnimationFrame(() => {
        document.addEventListener('click', this._onOutsideClick);
      });
    }
  };

  private _onOutsideClick = (e: MouseEvent) => {
    if (!this.el.contains(e.target as Node)) {
      this.hideTooltip();
      document.removeEventListener('click', this._onOutsideClick);
    }
  };

  render() {
    const item = this.item;
    const isClickMode = this.resolvedTrigger === 'click';
    const noTooltip = this.resolvedTrigger === 'none';
    const shouldRenderTooltip = !noTooltip && !!item && this._open;

    return [
      <div
        class="trigger"
        onClick={this.handleCardClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <slot>{this.renderVariant(item, isClickMode)}</slot>
      </div>,
      shouldRenderTooltip && item && (
        <div
          class={{ 'tooltip-wrapper': true, 'open': this._open }}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        >
          <dl-item-tooltip
            itemData={item}
            nameOverride={this.getNameOverride(item)}
            componentItemsData={this.componentItemsData ?? this._componentItems}
            parentItemsData={this.parentItemsData ?? this._parentItems}
          ></dl-item-tooltip>
        </div>
      ),
    ];
  }

  private renderVariant(item: Item | undefined, isClickMode: boolean) {
    switch (this.variant) {
      case 'icon':
        return this.renderIcon(item, isClickMode);
      case 'image':
        return this.renderImageOnly(item, isClickMode);
      case 'image-name':
        return this.renderImageName(item, isClickMode);
      case 'inline':
        return this.renderInlineItem(item, isClickMode, { image: true, name: true });
      case 'inline-text':
        return this.renderInlineItem(item, isClickMode, { image: false, name: true });
      case 'inline-image':
        return this.renderInlineItem(item, isClickMode, { image: true, name: false });
      case 'card':
      default:
        return this.renderDefaultCard(item, isClickMode);
    }
  }

  private getImageSrc(item: Item): string | undefined {
    return item.shop_image_webp || item.shop_image || item.image_webp || item.image || undefined;
  }

  private getSlotClass(item: Item | undefined): string {
    return item?.item_slot_type ?? 'neutral';
  }

  private getTriggerClasses(baseClass: string, item: Item | undefined, isClickMode: boolean, extra: ClassMap = {}): ClassMap {
    return {
      [baseClass]: true,
      'clickable': isClickMode,
      [this.getSlotClass(item)]: true,
      ...extra,
    };
  }

  private renderStateFallback(tag: RenderTag, baseClass: string, item: Item | undefined, options: { showErrorText?: boolean; extraClasses?: ClassMap } = {}) {
    const className = {
      [baseClass]: true,
      ...(options.extraClasses ?? {}),
    };

    if (this._loading || (!item && !this._error)) {
      return h(tag, { class: { ...className, 'loading': true } });
    }

    if (this._error) {
      const content = options.showErrorText
        ? this._error
        : <span class="item-error-glyph" aria-hidden="true">!</span>;
      return h(tag, { class: { ...className, 'error': true }, title: this._error, 'aria-label': this._error }, content);
    }
  }

  private renderImageOnly(item: Item | undefined, isClickMode: boolean) {
    const fallback = this.renderStateFallback('div', 'item-image-only', item);
    if (fallback) return fallback;

    const imgSrc = this.getImageSrc(item!);
    return (
      <div class={this.getTriggerClasses('item-image-only', item, isClickMode)}>
        {imgSrc && <img class="item-image-only-img" src={imgSrc} alt={this.displayName} loading="lazy" />}
      </div>
    );
  }

  private renderImageName(item: Item | undefined, isClickMode: boolean) {
    const fallback = this.renderStateFallback('div', 'item-image-name', item, { showErrorText: true });
    if (fallback) return fallback;

    const imgSrc = this.getImageSrc(item!);
    return (
      <div class={this.getTriggerClasses('item-image-name', item, isClickMode)}>
        {imgSrc && <img class="item-image-name-img" src={imgSrc} alt="" loading="lazy" />}
        <span class="item-image-name-text">{this.displayName}</span>
      </div>
    );
  }

  private renderInlineItem(item: Item | undefined, isClickMode: boolean, parts: InlineItemParts) {
    const imageOnly = parts.image && !parts.name;
    const fallback = this.renderStateFallback('span', 'item-inline-trigger', item, {
      showErrorText: parts.name,
      extraClasses: { 'image-only': imageOnly },
    });
    if (fallback) return fallback;

    const imgSrc = this.getImageSrc(item!);
    return (
      <span class={this.getTriggerClasses('item-inline-trigger', item, isClickMode, { 'image-only': imageOnly })}>
        {parts.image && imgSrc && <img class="item-inline-trigger-img" src={imgSrc} alt={parts.name ? '' : this.displayName} loading="lazy" />}
        {parts.name && <span class="item-inline-trigger-name">{this.displayName}</span>}
      </span>
    );
  }

  private renderIcon(item: Item | undefined, isClickMode: boolean) {
    const fallback = this.renderStateFallback('div', 'icon-box', item);
    if (fallback) return fallback;

    const slot = item!.item_slot_type;
    const tier = item!.item_tier;
    const imgSrc = this.getImageSrc(item!);
    const isActive = item!.is_active_item || (item!.activation !== 'passive');
    const hasImbue = !!item!.imbue;
    return (
      <div
        class={{
          'icon-box': true,
          'clickable': isClickMode,
          [`tier-${tier}`]: true,
          [slot]: true,
        }}
      >
        {(this.showTierBadge ?? true) && (
          <div class={{ 'tier-badge': true, [slot]: true }}>
            <span class="tier-badge-number">{ROMAN_NUMERALS[tier - 1] ?? tier}</span>
          </div>
        )}

        <div class="icon-image-container">
          {imgSrc && <img class="icon-image" src={imgSrc} alt={this.displayName} loading="lazy" />}
        </div>

        {isActive && !hasImbue && <span class="active-tag">Active</span>}
        {hasImbue && <span class="imbue-tag">Imbue</span>}
      </div>
    );
  }

  private getNameSizeClass(name: string): string | undefined {
    const length = name.trim().length;
    if (length > 24) return 'name-size-xs';
    if (length > 19) return 'name-size-sm';
    if (length > 14) return 'name-size-md';
  }

  private renderDefaultCard(item: Item | undefined, isClickMode: boolean) {
    if (this._loading || (!item && !this._error)) {
      return (
        <div class="mod-box loading">
          <div class="mod-icon-container"></div>
          <div class="mod-name-container"></div>
        </div>
      );
    }

    if (this._error) {
      return (
        <div class="mod-box">
          <div class="mod-icon-container"></div>
          <div class="mod-name-container">
            <span class="mod-name">{this._error}</span>
          </div>
        </div>
      );
    }

    const resolvedItem = item!;
    const slot = resolvedItem.item_slot_type;
    const tier = resolvedItem.item_tier;
    const imgSrc = this.getImageSrc(resolvedItem);
    const isActive = resolvedItem.is_active_item || (resolvedItem.activation !== 'passive');
    const hasImbue = !!resolvedItem.imbue;
    const cardBg = cardBackground(slot, tier);
    const name = this.displayName;
    const sizeClass = this.getNameSizeClass(name);
    return (
      <div
        class={{
          'mod-box': true,
          'clickable': isClickMode,
          [`tier-${tier}`]: true,
          [slot]: true,
        }}
      >
        {cardBg && <img class="card-background" src={cardBg} alt="" />}

        {(this.showTierBadge ?? configState.showTierBadge) && (
          <div class={{ 'tier-badge': true, [slot]: true }}>
            <span class="tier-badge-number">{ROMAN_NUMERALS[tier - 1] ?? tier}</span>
          </div>
        )}

        <div class="mod-icon-container">
          {imgSrc && <img class="mod-icon" src={imgSrc} alt={name} loading="lazy" />}
        </div>

        {isActive && !hasImbue && <span class="active-tag">Active</span>}
        {hasImbue && <span class="imbue-tag">Imbue</span>}

        <div class="mod-name-container">
          <span class={{ 'mod-name': true, [slot]: true, ...(sizeClass ? { [sizeClass]: true } : {}) }}>{name}</span>
        </div>
      </div>
    );
  }
}
