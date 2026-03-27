import { Component, Prop, State, Watch, h } from '@stencil/core';
import { Item, ItemSlotType, ItemTier } from '../../types';
import { fetchItemsBySlotType, fetchItems } from '../../api/client';
import { configState } from '../../store/config-store';

@Component({
  tag: 'dl-item-grid',
  styleUrl: 'dl-item-grid.css',
  shadow: true,
})
export class DlItemGrid {
  /** Filter items by slot type: `"weapon"`, `"vitality"`, or `"spirit"`. */
  @Prop({ attribute: 'slot-type' }) slotType?: ItemSlotType;

  /** Filter items by tier (1–4). */
  @Prop() tier?: ItemTier;

  /** When `true`, only shows items available in the shop. */
  @Prop({ attribute: 'shopable-only' }) shopableOnly = true;

  @State() private _items: Item[] = [];
  @State() private _loading = false;

  connectedCallback() {
    this.loadItems();
  }

  @Watch('slotType')
  @Watch('tier')
  propsChanged() {
    this.loadItems();
  }

  private async loadItems() {
    this._loading = true;
    const language = configState.language;
    try {
      let items: Item[];
      if (this.slotType) {
        items = await fetchItemsBySlotType(this.slotType, language);
      } else {
        items = await fetchItems(language);
      }

      items = items.filter(i => i.type === 'upgrade');
      if (this.shopableOnly) items = items.filter(i => i.shopable);
      if (this.tier) items = items.filter(i => i.item_tier === this.tier);

      items.sort((a, b) => (a.item_tier ?? 0) - (b.item_tier ?? 0) || (a.cost ?? 0) - (b.cost ?? 0));
      this._items = items;
    } catch {
      this._items = [];
    } finally {
      this._loading = false;
    }
  }

  render() {
    if (this._loading) {
      return <div class="loading">Loading items...</div>;
    }

    if (!this._items.length) {
      return <div class="empty">No items found</div>;
    }

    return (
      <div class="grid">
        {this._items.map(item => (
          <dl-item-card itemData={item}></dl-item-card>
        ))}
      </div>
    );
  }
}
