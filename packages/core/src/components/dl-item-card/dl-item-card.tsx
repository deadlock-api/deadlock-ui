import { Component, Prop, State, Watch, Element, h } from '@stencil/core';
import { computePosition, flip, shift, offset, autoUpdate, Placement, VirtualElement } from '@floating-ui/dom';
import { Item } from '../../types';
import { fetchItem } from '../../api/client';
import { configState, onConfigChange } from '../../store/config-store';
import { cardBackground } from '../../utils/assets';

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
  @Prop({ attribute: 'class-name' }) itemClassName?: string;

  /** Pre-loaded item data object. When provided, skips the API fetch. */
  @Prop({ attribute: 'item-data' }) itemData?: Item;

  /** Hover effect on the card. `"none"` does nothing, `"scale"` enlarges on hover. */
  @Prop({ reflect: true, attribute: 'hover-effect' }) hoverEffect: 'none' | 'scale' = 'none';

  /** Show the tier badge on hover. When not set, falls back to the global provider value. */
  @Prop({ attribute: 'show-tier-badge' }) showTierBadge?: boolean;

  @State() private _item?: Item;
  @State() private _loading = false;
  @State() private _error?: string;
  @State() private _open = false;

  private _hoverTimeout?: ReturnType<typeof setTimeout>;
  private _mouseX = 0;
  private _mouseY = 0;
  private _rafId?: number;
  private _cleanupAutoUpdate?: () => void;
  private _unsubLanguage?: () => void;

  private get item(): Item | undefined {
    return this.itemData ?? this._item;
  }

  private get cardEl(): HTMLElement | undefined {
    return this.el.shadowRoot?.querySelector('.mod-box') as HTMLElement | undefined;
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

  private get itemKey(): string | number | undefined {
    return this.itemId ?? this.itemClassName;
  }

  connectedCallback() {
    if (this.itemKey && !this.itemData) {
      this.fetchItemData();
    }
    this._unsubLanguage = onConfigChange('language', () => {
      if (this.itemKey && !this.itemData) {
        this.fetchItemData();
      }
    });
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

  private async fetchItemData() {
    const key = this.itemKey;
    if (!key) return;
    this._loading = true;
    this._error = undefined;
    try {
      this._item = await fetchItem(key, configState.language);
    } catch (e) {
      this._error = e instanceof Error ? e.message : 'Failed to load item';
    } finally {
      this._loading = false;
    }
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

  /** Tooltip mode: position relative to cursor via virtual element */
  private updatePositionFromMouse = () => {
    this.computeFloatingPosition(this.virtualRef);
  };

  /** Popover mode: position relative to card element */
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

  private showTooltipMode() {
    this._open = true;
    this.updatePositionFromMouse();
  }

  private showPopoverMode() {
    this._open = true;

    const card = this.cardEl;
    const floating = this.floatingEl;
    if (!card || !floating) return;

    this.updatePositionFromCard();
    this._cleanupAutoUpdate = autoUpdate(card, floating, this.updatePositionFromCard);
  }

  private hideTooltip() {
    this._open = false;
    clearTimeout(this._hoverTimeout);
    if (this._rafId != null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = undefined;
    }
    this._cleanupAutoUpdate?.();
    this._cleanupAutoUpdate = undefined;
  }

  private handleMouseEnter = (e: MouseEvent) => {
    if (configState.tooltipBehavior !== 'tooltip') return;
    this._mouseX = e.clientX;
    this._mouseY = e.clientY;
    this.el.addEventListener('mousemove', this.handleMouseMove);
    const delay = configState.tooltipDelay;
    if (delay > 0) {
      this._hoverTimeout = setTimeout(() => this.showTooltipMode(), delay);
    } else {
      this.showTooltipMode();
    }
  };

  private handleMouseLeave = () => {
    if (configState.tooltipBehavior !== 'tooltip') return;
    this.el.removeEventListener('mousemove', this.handleMouseMove);
    this.hideTooltip();
  };

  private handleCardClick = () => {
    if (configState.tooltipBehavior !== 'popover') return;
    if (this._open) {
      this.hideTooltip();
      document.removeEventListener('click', this._onOutsideClick);
    } else {
      this.showPopoverMode();
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

    if (this._loading || !item) {
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

    const slot = item.item_slot_type;
    const tier = item.item_tier;
    const imgSrc = item.shop_image_webp || item.shop_image || item.image_webp || item.image;
    const isActive = item.is_active_item || (item.activation !== 'passive');
    const hasImbue = !!item.imbue;
    const cardBg = cardBackground(slot, tier);
    const isPopover = configState.tooltipBehavior === 'popover';
    const noTooltip = configState.tooltipBehavior === 'none';
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V'];

    return [
      <div
        class={{
          'mod-box': true,
          'clickable': isPopover,
          [`tier-${tier}`]: true,
          [slot]: true,
        }}
        onClick={this.handleCardClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {cardBg && <img class="card-background" src={cardBg} alt="" />}

        {(this.showTierBadge ?? configState.showTierBadge) && (
          <div class={{ 'tier-badge': true, [slot]: true }}>
            <span class="tier-badge-number">{romanNumerals[tier - 1] ?? tier}</span>
          </div>
        )}

        <div class="mod-icon-container">
          {imgSrc && <img class="mod-icon" src={imgSrc} alt={item.name} loading="lazy" />}
        </div>

        {isActive && !hasImbue && <span class="active-tag">Active</span>}
        {hasImbue && <span class="imbue-tag">Imbue</span>}

        <div class="mod-name-container">
          <span class={{ 'mod-name': true, [slot]: true }}>{item.name}</span>
        </div>
      </div>,
      !noTooltip && (
        <dl-item-tooltip
          class={{ 'tooltip-wrapper': true, 'open': this._open }}
          itemData={item}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        ></dl-item-tooltip>
      ),
    ];
  }
}
