import { Component, Prop, State, Watch, h } from '@stencil/core';
import { Item, ItemSlotType } from '../../types';
import { fetchItems } from '../../api/client';
import { configState } from '../../store/config-store';
import { shopBackground, shopTabIcon } from '../../utils/assets';

const CATEGORIES: { label: string; slot: ItemSlotType; color: string }[] = [
  { label: 'Weapon', slot: 'weapon', color: '#cc8932' },
  { label: 'Vitality', slot: 'vitality', color: '#6dc04b' },
  { label: 'Spirit', slot: 'spirit', color: '#c878f0' },
];

const VALID_TABS = new Set<string>(CATEGORIES.map(c => c.slot));

const TIERS = [1, 2, 3, 4] as const;

@Component({
  tag: 'dl-shop-panel',
  styleUrl: 'dl-shop-panel.css',
  shadow: true,
})
export class DlShopPanel {
  /** The tab to display initially. One of `"weapon"`, `"vitality"`, or `"spirit"`. */
  @Prop({ reflect: true, attribute: 'active-tab' }) activeTab: ItemSlotType = 'weapon';

  /** Hover effect applied to each item card. One of `"none"` or `"scale"`. */
  @Prop({ reflect: true, attribute: 'hover-effect' }) hoverEffect: 'none' | 'scale' = 'scale';

  @State() private _items: Item[] = [];
  @State() private _loading = false;
  @State() private _activeTab: ItemSlotType = 'weapon';

  @Watch('activeTab')
  onActiveTabChange(value: string) {
    if (VALID_TABS.has(value)) {
      this._activeTab = value as ItemSlotType;
    }
  }

  connectedCallback() {
    if (VALID_TABS.has(this.activeTab)) {
      this._activeTab = this.activeTab;
    }
    this.loadItems();
  }

  private async loadItems() {
    this._loading = true;
    try {
      const language = configState.language;
      const items = await fetchItems(language);
      this._items = items
        .filter(i => i.type === 'upgrade' && i.shopable && !i.disabled)
        .sort((a, b) => a.class_name.localeCompare(b.class_name));
    } catch {
      this._items = [];
    } finally {
      this._loading = false;
    }
  }

  private getItemsBySlotAndTier(slot: ItemSlotType, tier: number): Item[] {
    return this._items.filter(
      i => i.item_slot_type === slot && i.item_tier === tier,
    );
  }

  private handleTabClick(slot: ItemSlotType) {
    this._activeTab = slot;
  }

  render() {
    if (this._loading) {
      return <div class="shop"><div class="loading">Loading items...</div></div>;
    }

    return (
      <div class="shop">
        <div class="nav-container">
          {CATEGORIES.map(cat => {
            const isActive = this._activeTab === cat.slot;
            return (
              <div
                class={{ 'category-tab': true, [`is-${cat.slot}`]: true, 'active': isActive }}
                onClick={() => this.handleTabClick(cat.slot)}
              >
                <div class="category-icon-container">
                  <div
                    class={{ 'category-icon': true, 'active': isActive }}
                    style={{ backgroundImage: `url("${shopTabIcon(cat.slot, isActive)}")` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        <div
          class={{ 'tiers': true, [this._activeTab]: true }}
          style={{ backgroundImage: `url("${shopBackground(this._activeTab)}")` }}
        >
          {TIERS.map(tier => {
            const items = this.getItemsBySlotAndTier(this._activeTab, tier);
            return (
              <div class={{ 'tier-section': true, [`tier-${tier}`]: true }}>
                {items.length > 0 && (
                  <div class={{ 'mods-grid': true, [`tier-${tier}`]: true }}>
                    {items.map(item => (
                      <dl-item-card itemData={item} hoverEffect={this.hoverEffect}></dl-item-card>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
