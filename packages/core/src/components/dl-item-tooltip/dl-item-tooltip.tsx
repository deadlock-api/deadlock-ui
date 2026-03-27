import { Component, Prop, h } from '@stencil/core';
import { Item, TooltipSection } from '../../types';
import { formatPropertyValue, isPropertyVisible, formatCost, getSlotColor } from '../../utils/format';
import { tooltipHeaderBg, tooltipBodyBg, soulIcon } from '../../utils/assets';

@Component({
  tag: 'dl-item-tooltip',
  styleUrl: 'dl-item-tooltip.css',
  shadow: true,
})
export class DlItemTooltip {
  /** Item data to display in the tooltip. */
  @Prop() itemData?: Item;

  private renderImportantProp(key: string) {
    const item = this.itemData;
    if (!item?.properties) return null;

    const prop = item.properties[key];
    if (!prop || !isPropertyVisible(prop)) return null;

    const value = formatPropertyValue(prop);

    return (
      <div class={{ 'important-stat-box': true, [`prop-${prop.css_class ?? ''}`]: !!prop.css_class }}>
        <div class="important-stat-icon-value">
          {prop.icon && <img class="important-stat-icon" src={prop.icon} alt="" />}
          <div class="important-stat-value">{value}</div>
        </div>
        <div class="important-stat-label">{prop.label ?? key}</div>
        {prop.conditional && <div class="important-stat-conditional">Conditional</div>}
      </div>
    );
  }

  private renderProperty(key: string, elevated: boolean) {
    const item = this.itemData;
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

  private renderSectionContent(section: TooltipSection) {
    return section.section_attributes.map(attr => {
      const importantKeys = new Set(attr.important_properties ?? []);
      const regularProps = [
        ...(attr.properties ?? []),
        ...(attr.elevated_properties ?? []),
      ].filter(k => !importantKeys.has(k));
      const elevatedSet = new Set(attr.elevated_properties ?? []);
      const importantList = attr.important_properties ?? [];

      return [
        attr.loc_string && (
          <div class="mod-info-label" innerHTML={attr.loc_string}></div>
        ),

        importantList.length > 0 && (
          <div class={{ 'important-stats-wrapper': true, [`count-${importantList.length}`]: true }}>
            {importantList.map(k => this.renderImportantProp(k))}
          </div>
        ),

        ...regularProps.map(propKey => this.renderProperty(propKey, elevatedSet.has(propKey))),
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

  private renderAbilitySection(section: TooltipSection) {
    const sectionType = section.section_type ?? 'passive';

    return (
      <div class="section">
        <div class={{ 'ability-type-label': true, [sectionType]: true }}>{sectionType}</div>
        {this.renderSectionContent(section)}
      </div>
    );
  }

  render() {
    const item = this.itemData;
    if (!item) return null;

    const slot = item.item_slot_type;
    const slotColor = getSlotColor(slot);
    const headerBg = tooltipHeaderBg(slot);
    const bodyBg = tooltipBodyBg(slot);

    const innateSections = item.tooltip_sections?.filter(s => s.section_type === 'innate') ?? [];
    const abilitySections = item.tooltip_sections?.filter(s => s.section_type !== 'innate') ?? [];

    return (
      <div class={{ 'tooltip': true, [`${slot}-mod`]: true }} style={{ '--slot-color': slotColor }}>
        {/* ── Header ── */}
        <div class="header-container" style={{ backgroundImage: `url("${headerBg}")` }}>
          <div class="mod-name-container">
            <div class="mod-name">{item.name}</div>
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
        </div>
      </div>
    );
  }
}
