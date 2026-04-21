import { Component, Prop, State, Watch, h } from '@stencil/core';
import type { VNode } from '@stencil/core';
import { Item, ItemProperty, ItemClassName, Language, TooltipSection } from '../../types';
import { isPropertyVisible, getSlotColor } from '../../utils/format';
import { tooltipHeaderBg, tooltipBodyBg, soulIcon } from '../../utils/assets';
import { fetchItem, fetchItems } from '../../api/client';
import { configState, onConfigChange } from '../../store/config-store';
import { injectFonts } from '../../utils/fonts';

export interface ComponentItemInfo {
  name: string;
  image?: string;
}

interface SectionTiming {
  key: string;
  prop: ItemProperty;
}

@Component({
  tag: 'dl-item-tooltip',
  styleUrl: 'dl-item-tooltip.css',
  shadow: true,
})
export class DlItemTooltip {
  // ─── Standalone fetch props ───────────────────────────────────────────────

  /** Item numeric ID. Alternative to `class-name`. */
  @Prop({ attribute: 'item-id' }) itemId?: number;

  /** Item class name (e.g. `"upgrade_capacitor"`). Alternative to `item-id`. */
  @Prop({ attribute: 'class-name' }) itemClassName?: ItemClassName;

  // ─── Pre-loaded data props (used by dl-item-card) ─────────────────────────

  /** Pre-loaded item data object. When provided, skips the API fetch. */
  @Prop() itemData?: Item;

  /** Resolved component items to display at the bottom of the tooltip. */
  @Prop() componentItemsData?: ComponentItemInfo[];

  /** Resolved parent items (items this item is a component of). */
  @Prop() parentItemsData?: ComponentItemInfo[];

  /** Override the item name displayed in the tooltip header. */
  @Prop() nameOverride?: string;

  /** Fetch and display the item name in a different language than the global config. */
  @Prop({ attribute: 'item-name-language' }) itemNameLanguage?: Language;

  // ─── Internal state ───────────────────────────────────────────────────────

  @State() private _item?: Item;
  @State() private _componentItems?: ComponentItemInfo[];
  @State() private _parentItems?: ComponentItemInfo[];
  @State() private _nameOverride?: string;
  @State() private _loading = false;
  @State() private _error?: string;

  private _unsubLanguage?: () => void;

  // ─── Resolved item (prop takes precedence over fetched) ──────────────────

  private get item(): Item | undefined {
    return this.itemData ?? this._item;
  }

  private get itemKey(): ItemClassName | number | undefined {
    return this.itemId ?? this.itemClassName;
  }

  private get displayName(): string {
    // nameOverride prop (from dl-item-card) takes highest priority,
    // then internally resolved name override, then item name
    return this.nameOverride ?? this._nameOverride ?? this.item?.name ?? '';
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  connectedCallback() {
    injectFonts();

    if (this.itemKey && !this.itemData) {
      this.fetchItemData();
    } else if (this.itemData) {
      this.resolveComponentItems();
      this.resolveParentItems();
      this.resolveNameOverride();
    }

    this._unsubLanguage = onConfigChange('language', () => {
      if (this.itemKey && !this.itemData) {
        this.fetchItemData();
      }
    });
  }

  disconnectedCallback() {
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
    this.resolveNameOverride();
  }

  // ─── Data fetching ────────────────────────────────────────────────────────

  private async fetchItemData() {
    const key = this.itemKey;
    if (!key) return;

    this._loading = true;
    this._error = undefined;

    try {
      this._item = await fetchItem(key, configState.language);
      this.resolveComponentItems();
      this.resolveParentItems();
      this.resolveNameOverride();
    } catch (e) {
      this._error = e instanceof Error ? e.message : 'Failed to load item';
    } finally {
      this._loading = false;
    }
  }

  private async resolveComponentItems() {
    const item = this.item;
    if (!item?.component_items?.length || this.componentItemsData) return;

    try {
      const allItems = await fetchItems(configState.language);
      const byClassName = new Map<string, Item>(allItems.map(i => [i.class_name, i]));
      const resolved: ComponentItemInfo[] = [];

      for (const cn of item.component_items) {
        const comp = byClassName.get(cn);
        if (!comp) continue;
        resolved.push({
          name: comp.name,
          image: comp.shop_image_webp || comp.shop_image || comp.image_webp || comp.image || undefined,
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
      const allItems = await fetchItems(configState.language);
      const parents: ComponentItemInfo[] = [];

      for (const other of allItems) {
        if (other.component_items?.includes(item.class_name)) {
          parents.push({
            name: other.name,
            image: other.shop_image_webp || other.shop_image || other.image_webp || other.image || undefined,
          });
        }
      }

      this._parentItems = parents.length > 0 ? parents : undefined;
    } catch {
      // silently fail
    }
  }

  private async resolveNameOverride() {
    const item = this.item;
    if (!item || !this.itemNameLanguage || this.itemNameLanguage === configState.language) {
      this._nameOverride = undefined;
      return;
    }

    try {
      const items = await fetchItems(this.itemNameLanguage);
      const match = items.find(i => i.class_name === item.class_name);
      this._nameOverride = match?.name;
    } catch {
      // silently fail — fall back to default name
      this._nameOverride = undefined;
    }
  }

  // ─── Rendering helpers (unchanged) ───────────────────────────────────────

  private static STATUS_EFFECT_LABELS: Record<string, { label: string; sublabel: string }> = {
    StatusEffectStun: { label: 'Stuns', sublabel: 'targets hit' },
    StatusEffectDisarmed: { label: 'Disarms', sublabel: 'targets hit' },
    StatusEffectEMP: { label: 'Silences', sublabel: 'targets hit' },
    StatusEffectInvisible: { label: 'Invisible', sublabel: 'targets hit' },
    StatusEffectInfiniteClip: { label: 'Infinite Clip', sublabel: '' },
  };

  private static DEFAULT_BINDING_KEYS: Record<string, string> = {
    AbilityMelee: 'Q',
    Ability1: '1',
    Ability2: '2',
    Ability3: '3',
    Ability4: '4',
    Item1: 'Z',
    Item2: 'X',
    Item3: 'C',
    Item4: 'V',
    Mantle: 'SPACE',
    Roll: 'SHIFT',
    Crouch: 'CTRL',
    MoveDown: 'CTRL',
    OpenHeroSheet: 'B',
    PurchaseQuickbuy: 'G',
    Scoreboard: 'TAB',
    Reload: 'R',
    ReplayDeath: 'R',
    ExtraInfo: 'ALT',
    AltCast: 'MOUSE3',
    MoveForward: 'W',
    MoveBackwards: 'S',
    MoveLeft: 'A',
    MoveRight: 'D',
    Attack: 'MOUSE1',
    ADS: 'MOUSE2',
    HeldItem: 'F',
    Zipline: 'SPACE',
    PushToTalk: 'T',
  };

  private getFormattedParts(prop: ItemProperty) {
    const value = prop.value === null || prop.value === undefined ? '' : String(prop.value);
    const numericValue = Number.parseFloat(value);
    const sign = Number.isFinite(numericValue) && numericValue >= 0 ? '+' : '';
    const prefix = prop.prefix?.replace('{s:sign}', sign) ?? '';
    const postfix = prop.postfix ?? '';
    const trimmedPostfix = postfix.trim();
    const suffix = trimmedPostfix && value.endsWith(trimmedPostfix) ? '' : postfix;

    return { prefix, value, suffix };
  }

  private static escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#39;',
    })[char] ?? char);
  }

  private formatDescriptionHtml(html: string): string {
    return html.replace(
      /\{g:citadel_(?:binding|keybind):(?:'([^']+)'|"([^"]+)"|([^}]+))\}/g,
      (_match, singleQuoted?: string, doubleQuoted?: string, bare?: string) => {
        const binding = (singleQuoted ?? doubleQuoted ?? bare ?? '').trim().replace(/^Default\./, '');
        const key = DlItemTooltip.DEFAULT_BINDING_KEYS[binding] ?? binding;

        return `<span class="InlineKey">${DlItemTooltip.escapeHtml(key)}</span>`;
      },
    );
  }

  private renderFormattedValue(prop: ItemProperty, shrinkPostfix = false): VNode {
    const { prefix, value, suffix } = this.getFormattedParts(prop);

    return (
      <span class={{ 'full-property-value': true, 'is-negative': prop.negative_attribute === true }}>
        {prefix && <span class="prefix-value">{prefix}</span>}
        <span class="property-value">{value}</span>
        {suffix && <span class={{ 'postfix-value': true, 'shrink': shrinkPostfix }}>{suffix}</span>}
      </span>
    );
  }

  private isTimingKey(key: string, prop?: ItemProperty | null): boolean {
    void prop;
    return key === 'AbilityCooldown'
      || key === 'ProcCooldown'
      || key === 'AbilityChargeUpTime'
      || key === 'AbilityCooldownBetweenCharge';
  }

  private renderImportantProp(key: string): VNode | null {
    const item = this.item;
    if (!item?.properties) return null;

    const prop = item.properties[key];

    if (!prop || !isPropertyVisible(prop)) {
      const statusEffect = DlItemTooltip.STATUS_EFFECT_LABELS[key];
      if (!statusEffect) return null;

      return (
        <div class="important-stat-box status-effect">
          <div class="important-stat-content">
            <div class="important-stat-value">{statusEffect.label}</div>
            {statusEffect.sublabel && <div class="important-stat-label">{statusEffect.sublabel}</div>}
          </div>
        </div>
      );
    }

    return (
      <div class={{ 'important-stat-box': true, [`prop_${prop.css_class ?? ''}`]: !!prop.css_class }}>
        <div class="important-stat-content">
          <div class={{ 'important-stat-icon-value': true, 'hide-important-stat-icon': !prop.icon }}>
            {prop.icon && <img class="important-stat-icon" src={prop.icon} alt="" />}
            <div class="important-stat-value">{this.renderFormattedValue(prop, true)}</div>
          </div>
          <div class="important-stat-labels">
            <div class="important-stat-type">{prop.label ?? key}</div>
            {(prop.conditional || prop.usage_flags?.includes('ConditionallyApplied')) && (
              <div class="important-stat-label">Conditional</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  private renderBlockProperty(key: string, elevated: boolean): VNode | null {
    const item = this.item;
    if (!item?.properties) return null;

    const prop = item.properties[key];
    if (!prop || !isPropertyVisible(prop)) return null;

    return (
      <div class="block-prop-item shrink-container">
        <span class="attribute-value">{this.renderFormattedValue(prop)}</span>
        <span class={{ 'attribute-name': true, 'elevated': elevated }}>{prop.label ?? key}</span>
      </div>
    );
  }

  private renderSectionContent(section: TooltipSection, excludedKeys = new Set<string>()) {
    const itemProperties = this.item?.properties;

    return section.section_attributes.map(attr => {
      const importantKeys = new Set(attr.important_properties ?? []);
      const isExcluded = (key: string) => excludedKeys.has(key) || this.isTimingKey(key, itemProperties?.[key]);

      const importantList = (attr.important_properties ?? []).filter(key => !isExcluded(key));
      const regularProps = [
        ...(attr.elevated_properties ?? []),
        ...(attr.properties ?? []),
      ].filter(key => !importantKeys.has(key) && !isExcluded(key));
      const elevatedSet = new Set(attr.elevated_properties ?? []);
      const importantNodes: VNode[] = [];
      const regularNodes: VNode[] = [];

      importantList.forEach(key => {
        const node = this.renderImportantProp(key);
        if (node) importantNodes.push(node);
      });

      regularProps.forEach(key => {
        const node = this.renderBlockProperty(key, elevatedSet.has(key));
        if (node) regularNodes.push(node);
      });

      const hasImportant = importantNodes.length > 0;
      const hasRegular = regularNodes.length > 0;
      const hasDescription = !!attr.loc_string;
      const descriptionHtml = attr.loc_string ? this.formatDescriptionHtml(attr.loc_string) : '';

      return (
        <div
          class={{
            'applied-attributes-container': true,
            'has-description': hasDescription,
            'has-important': hasImportant,
            'has-multiple-important': importantNodes.length >= 2,
            [`important-count-${importantNodes.length}`]: hasImportant,
            'no-applied-stats': !hasRegular,
          }}
        >
          {descriptionHtml && <div class="mod-info-label" innerHTML={descriptionHtml}></div>}

          {(hasImportant || hasRegular) && (
            <div
              class={{
                'stats-block': true,
                'stats-block-inline': importantNodes.length === 1 && hasRegular,
                'stats-block-stacked': importantNodes.length > 3 || (importantNodes.length >= 2 && hasRegular),
                'stats-block-no-important': !hasImportant,
              }}
            >
              {hasImportant && (
                <div class={{ 'important-stats-wrapper': true, [`count-${importantNodes.length}`]: true }}>
                  {importantNodes}
                </div>
              )}
              {hasRegular && (
                <div class="stats-block-props">
                  {regularNodes}
                </div>
              )}
              {!hasRegular && hasImportant && <div class="stats-block-props empty"></div>}
            </div>
          )}
        </div>
      );
    });
  }

  private findSectionTimings(section: TooltipSection): { cooldown?: SectionTiming; chargeUp?: SectionTiming } {
    const item = this.item;
    if (!item?.properties) return {};

    const props = item.properties;
    const timings: { cooldown?: SectionTiming; chargeUp?: SectionTiming } = {};

    const addTiming = (key: string) => {
      const prop = props[key];
      if (!prop || !isPropertyVisible(prop)) return;

      if (key === 'AbilityChargeUpTime' || key === 'AbilityCooldownBetweenCharge') {
        timings.chargeUp = { key, prop };
        return;
      }

      if (key === 'ProcCooldown' || key === 'AbilityCooldown') {
        if (!timings.cooldown || key === 'ProcCooldown') {
          timings.cooldown = { key, prop };
        }
      }
    };

    for (const attr of section.section_attributes) {
      [
        ...(attr.important_properties ?? []),
        ...(attr.elevated_properties ?? []),
        ...(attr.properties ?? []),
      ].forEach(addTiming);
    }

    if (!timings.cooldown && section.section_type === 'active') {
      addTiming('AbilityCooldown');
    }

    return timings;
  }

  private renderTimingPill(timing: SectionTiming, kind: 'cooldown' | 'charge-up'): VNode {
    const fallbackIcon = kind === 'cooldown' ? this.item?.properties?.['AbilityCooldown']?.icon : undefined;
    const icon = timing.prop.icon || fallbackIcon;

    return (
      <span class={{ 'ability-timing': true, [kind]: true }}>
        {icon && <img class="ability-timing-icon" src={icon} alt="" />}
        <span class="ability-timing-value">{this.renderFormattedValue(timing.prop, true)}</span>
      </span>
    );
  }

  private renderInnateSection(section: TooltipSection) {
    return (
      <div class="section innate-section">
        {this.renderSectionContent(section)}
      </div>
    );
  }

  private renderAbilitySection(section: TooltipSection) {
    const sectionType = section.section_type ?? 'passive';
    const timings = this.findSectionTimings(section);
    const excludedKeys = new Set<string>();

    if (timings.cooldown) excludedKeys.add(timings.cooldown.key);
    if (timings.chargeUp) excludedKeys.add(timings.chargeUp.key);

    return (
      <div class={{ 'section': true, 'ability-section': true, [`ability-type-${sectionType}`]: true }}>
        <div class={{ 'ability-type-label': true, [sectionType]: true }}>
          <span class="ability-type-text">{sectionType}</span>
          {(timings.cooldown || timings.chargeUp) && (
            <span class="ability-timing-group">
              {timings.cooldown && this.renderTimingPill(timings.cooldown, 'cooldown')}
              {timings.chargeUp && this.renderTimingPill(timings.chargeUp, 'charge-up')}
            </span>
          )}
        </div>
        {this.renderSectionContent(section, excludedKeys)}
      </div>
    );
  }

  private renderComponentGroup(label: string, items?: ComponentItemInfo[]): VNode | null {
    if (!items || items.length === 0) return null;

    return (
      <div class="component-items-section">
        <div class="component-items-label">{label}</div>
        <div class="component-items-grid">
          {items.map(item => (
            <div class="component-item">
              {item.image && <img class="component-item-icon" src={item.image} alt="" />}
              <span class="component-item-name">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  render() {
    // Loading state (only shown in standalone mode)
    if (this._loading) {
      return (
        <div class="tooltip loading" style={{ '--slot-color': 'transparent' }}>
          <div class="tooltip-shadow">
            <div class="tooltip-main">
              <div class="header-container" style={{ background: '#1a1a2e' }}></div>
              <div class="properties-container"></div>
            </div>
          </div>
        </div>
      );
    }

    // Error state (only shown in standalone mode)
    if (this._error) {
      return (
        <div class="tooltip error" style={{ '--slot-color': 'transparent' }}>
          <div class="tooltip-shadow">
            <div class="tooltip-main">
              <div class="header-container" style={{ background: '#1a1a2e' }}>
                <div class="mod-name-container shrink-container">
                  <div class="mod-name shrink">{this._error}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const item = this.item;
    if (!item) return null;

    const slot = item.item_slot_type;
    const slotColor = getSlotColor(slot);
    const headerBg = tooltipHeaderBg(slot);
    const bodyBg = tooltipBodyBg(slot);
    const sections = item.tooltip_sections ?? [];
    const resolvedComponentItems = this.componentItemsData ?? this._componentItems;
    const resolvedParentItems = this.parentItemsData ?? this._parentItems;
    const hasComponents = !!resolvedComponentItems?.length;
    const hasParents = !!resolvedParentItems?.length;

    return (
      <div
        class={{
          'tooltip': true,
          [`${slot}-mod`]: true,
          'has-components': hasComponents || hasParents,
        }}
        style={{ '--slot-color': slotColor }}
      >
        <div class="tooltip-shadow">
          <div class="tooltip-main">
            {/* ── Header ── */}
            <div class="header-container" style={{ backgroundImage: `url("${headerBg}")` }}>
              <div class="mod-name-container shrink-container">
                <div class="mod-name shrink">{this.displayName}</div>
                {item.cost != null && item.cost > 0 && (
                  <div class="mod-cost">
                    <img class="soul-icon" src={soulIcon()} alt="Souls" />
                    {String(item.cost)}
                  </div>
                )}
              </div>
            </div>

            {/* ── Properties body ── */}
            <div class="properties-container" style={{ backgroundImage: `url("${bodyBg}")` }}>
              {sections.map(section => (
                section.section_type === 'innate'
                  ? this.renderInnateSection(section)
                  : this.renderAbilitySection(section)
              ))}
            </div>
          </div>

          {(hasComponents || hasParents) && (
            <div class="component-items-shell" style={{ backgroundImage: `url("${bodyBg}")` }}>
              {this.renderComponentGroup('Component:', resolvedComponentItems)}
              {this.renderComponentGroup('Component of:', resolvedParentItems)}
            </div>
          )}
        </div>
      </div>
    );
  }
}
