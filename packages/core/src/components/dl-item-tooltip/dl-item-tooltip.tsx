import { Component, Prop, State, Watch, h } from '@stencil/core';
import { Item, ItemProperty, ItemClassName, Language, TooltipSection } from '../../types';
import { formatPropertyValue, isPropertyVisible, formatCost, getSlotColor } from '../../utils/format';
import { tooltipHeaderBg, tooltipBodyBg, soulIcon } from '../../utils/assets';
import { fetchItem, fetchItems } from '../../api/client';
import { configState, onConfigChange } from '../../store/config-store';
import { injectFonts } from '../../utils/fonts';

export interface ComponentItemInfo {
  name: string;
  image?: string;
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
    }
  }

  private get displayName(): string {
    // nameOverride prop (from dl-item-card) takes highest priority,
    // then internally resolved name override, then item name
    return this.nameOverride ?? this._nameOverride ?? this.item?.name ?? '';
  }

  // ─── Rendering helpers (unchanged) ───────────────────────────────────────

  private static STATUS_EFFECT_LABELS: Record<string, { label: string; sublabel: string }> = {
    StatusEffectStun: { label: 'Stuns', sublabel: 'targets hit' },
    StatusEffectDisarmed: { label: 'Disarms', sublabel: 'targets hit' },
    StatusEffectEMP: { label: 'Silences', sublabel: 'targets hit' },
    StatusEffectInvisible: { label: 'Invisible', sublabel: 'targets hit' },
    StatusEffectInfiniteClip: { label: 'Infinite Clip', sublabel: '' },
  };

  private renderImportantProp(key: string) {
    const item = this.item;
    if (!item?.properties) return null;

    const prop = item.properties[key];

    if (!prop || !isPropertyVisible(prop)) {
      const statusEffect = DlItemTooltip.STATUS_EFFECT_LABELS[key];
      if (statusEffect) {
        return (
          <div class="important-stat-box status-effect">
            <div class="important-stat-value">{statusEffect.label}</div>
            {statusEffect.sublabel && <div class="important-stat-label">{statusEffect.sublabel}</div>}
          </div>
        );
      }
      return null;
    }

    const value = formatPropertyValue(prop);

    return (
      <div class={{ 'important-stat-box': true, [`prop-${prop.css_class ?? ''}`]: !!prop.css_class }}>
        <div class="important-stat-icon-value">
          {prop.icon && <img class="important-stat-icon" src={prop.icon} alt="" />}
          <div class="important-stat-value">{value}</div>
        </div>
        <div class="important-stat-label">{prop.label ?? key}</div>
        {(prop.conditional || prop.usage_flags?.includes('ConditionallyApplied')) && (
          <div class="important-stat-conditional">Conditional</div>
        )}
      </div>
    );
  }

  private renderProperty(key: string, elevated: boolean) {
    const item = this.item;
    if (!item?.properties) return null;

    const prop = item.properties[key];
    if (!prop || !isPropertyVisible(prop)) return null;

    const value = formatPropertyValue(prop);
    const isNegative = prop.negative_attribute === true;

    return [
      <div class="attribute-line-item">
        {prop.icon && <img class="prop-icon" src={prop.icon} alt="" />}
        <span class={{ 'attribute-value': true, 'elevated': elevated, 'negative': isNegative }}>
          {value}
        </span>
        <span class="attribute-name">{prop.label ?? key}</span>
      </div>,
      prop.conditional && <div class="conditional" innerHTML={prop.conditional}></div>,
    ];
  }

  private renderBlockProperty(key: string, elevated: boolean) {
    const item = this.item;
    if (!item?.properties) return null;

    const prop = item.properties[key];
    if (!prop || !isPropertyVisible(prop)) return null;

    const value = formatPropertyValue(prop);
    const isNegative = prop.negative_attribute === true;

    return (
      <div class="block-prop-item">
        <span class={{ 'attribute-value': true, 'elevated': elevated, 'negative': isNegative }}>
          {value}
        </span>
        <span class="attribute-name">{prop.label ?? key}</span>
      </div>
    );
  }

  private renderSectionContent(section: TooltipSection, excludeKey?: string) {
    return section.section_attributes.map(attr => {
      const importantKeys = new Set(attr.important_properties ?? []);
      const regularProps = [
        ...(attr.properties ?? []),
        ...(attr.elevated_properties ?? []),
      ].filter(k => !importantKeys.has(k) && k !== excludeKey);
      const elevatedSet = new Set(attr.elevated_properties ?? []);
      const importantList = attr.important_properties ?? [];
      const hasImportant = importantList.length > 0;

      return [
        attr.loc_string && (
          <div class="mod-info-label" innerHTML={attr.loc_string}></div>
        ),

        hasImportant ? (
          <div class={{ 'stats-block': true, 'stats-block-inline': importantList.length === 1 && regularProps.length > 0 }}>
            <div class={{ 'important-stats-wrapper': true, [`count-${importantList.length}`]: true }}>
              {importantList.map(k => this.renderImportantProp(k))}
            </div>
            {regularProps.length > 0 && (
              <div class="stats-block-props">
                {regularProps.map(propKey => this.renderBlockProperty(propKey, elevatedSet.has(propKey)))}
              </div>
            )}
          </div>
        ) : (
          regularProps.map(propKey => this.renderProperty(propKey, elevatedSet.has(propKey)))
        ),
      ];
    });
  }

  private renderInnateSection(section: TooltipSection) {
    return (
      <div class="section innate-section">
        {this.renderSectionContent(section)}
      </div>
    );
  }

  private isCooldownKey(key: string, prop: ItemProperty): boolean {
    return prop.css_class === 'cooldown'
      || key === 'AbilityCooldown'
      || key === 'ProcCooldown'
      || key === 'AbilityChargeUpTime';
  }

  private findSectionCooldown(section: TooltipSection) {
    const item = this.item;
    if (!item?.properties) return null;

    for (const attr of section.section_attributes) {
      const allProps = [...(attr.properties ?? []), ...(attr.elevated_properties ?? [])];
      for (const key of allProps) {
        const prop = item.properties[key];
        if (prop && this.isCooldownKey(key, prop) && isPropertyVisible(prop)) {
          return { key, prop };
        }
      }
    }

    const cooldown = item.properties['AbilityCooldown'];
    if (cooldown && isPropertyVisible(cooldown)) {
      return { key: 'AbilityCooldown', prop: cooldown };
    }

    return null;
  }

  private renderAbilitySection(section: TooltipSection) {
    const sectionType = section.section_type ?? 'passive';
    const cooldown = this.findSectionCooldown(section);

    return (
      <div class="section">
        <div class={{ 'ability-type-label': true, [sectionType]: true }}>
          <span>{sectionType}</span>
          {cooldown && (
            <span class="ability-cooldown">
              {(cooldown.prop.icon || this.item?.properties?.['AbilityCooldown']?.icon) && (
                <img
                  class="ability-cooldown-icon"
                  src={cooldown.prop.icon || this.item!.properties!['AbilityCooldown']!.icon!}
                  alt=""
                />
              )}
              {formatPropertyValue(cooldown.prop)}
            </span>
          )}
        </div>
        {this.renderSectionContent(section, cooldown?.key)}
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  render() {
    // Loading state (only shown in standalone mode)
    if (this._loading) {
      return (
        <div class="tooltip" style={{ '--slot-color': 'transparent' }}>
          <div class="header-container" style={{ background: '#1a1a2e' }}></div>
          <div class="properties-container"></div>
        </div>
      );
    }

    // Error state (only shown in standalone mode)
    if (this._error) {
      return (
        <div class="tooltip" style={{ '--slot-color': 'transparent' }}>
          <div class="header-container" style={{ background: '#1a1a2e' }}>
            <div class="mod-name-container">
              <div class="mod-name">{this._error}</div>
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

    const innateSections = item.tooltip_sections?.filter(s => s.section_type === 'innate') ?? [];
    const abilitySections = item.tooltip_sections?.filter(s => s.section_type !== 'innate') ?? [];

    const resolvedComponentItems = this.componentItemsData ?? this._componentItems;
    const resolvedParentItems = this.parentItemsData ?? this._parentItems;

    return (
      <div class={{ 'tooltip': true, [`${slot}-mod`]: true }} style={{ '--slot-color': slotColor }}>
        {/* ── Header ── */}
        <div class="header-container" style={{ backgroundImage: `url("${headerBg}")` }}>
          <div class="mod-name-container">
            <div class="mod-name">{this.displayName}</div>
            {item.cost != null && item.cost > 0 && (
              <div class="mod-cost">
                <img class="soul-icon" src={soulIcon()} alt="Souls" />
                {formatCost(item.cost)}
              </div>
            )}
          </div>
        </div>

        {/* ── Properties body ── */}
        <div class="properties-container" style={{ backgroundImage: `url("${bodyBg}")` }}>
          {innateSections.map(s => this.renderInnateSection(s))}
          {abilitySections.map(s => this.renderAbilitySection(s))}

          {resolvedComponentItems && resolvedComponentItems.length > 0 && (
            <div class="component-items-section">
              <div class="component-items-label">Component:</div>
              <div class="component-items-grid">
                {resolvedComponentItems.map(comp => (
                  <div class="component-item">
                    {comp.image && <img class="component-item-icon" src={comp.image} alt="" />}
                    <span class="component-item-name">{comp.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resolvedParentItems && resolvedParentItems.length > 0 && (
            <div class="component-items-section">
              <div class="component-items-label">Component of:</div>
              <div class="component-items-grid">
                {resolvedParentItems.map(parent => (
                  <div class="component-item">
                    {parent.image && <img class="component-item-icon" src={parent.image} alt="" />}
                    <span class="component-item-name">{parent.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
