const CDN_BASE = 'https://assets-bucket.deadlock-api.com/assets-api-res';

function cdn(path: string): string {
  return `${CDN_BASE}/${path}`;
}

export function cardBackground(slot: string, tier: number): string {
  return cdn(`images/shop/catalog/cards/card_backer_${slot}_t${tier}.png`);
}

export function tooltipHeaderBg(slot: string): string {
  return cdn(`images/shop/catalog/catalog_tooltip_header_${slot}.png`);
}

export function tooltipBacker(slot: string): string {
  return cdn(`images/tooltips/items/tooltip_backer_${slot}.png`);
}

export function corruptedTooltipBacker(slot: string): string {
  return cdn(`images/tooltips/items/tooltip_backer_${slot}_corrupted.png`);
}

/** Frame drawn around the normal item image; corrupted items have no icon of their own. */
export function corruptedItemFrame(active = false): string {
  return cdn(`images/shop/corrupted_items/item_frame_corrupted${active ? '_active' : ''}.png`);
}

export function shopBackground(slot: string): string {
  const mapped = slot === 'tech' ? 'spirit' : slot;
  return cdn(`images/shop/catalog/catalog_shop_bg_${mapped}.webp`);
}

export function shopTabShape(): string {
  return cdn('images/shop/catalog/catalog_shop_tab_shape.png');
}

export function shopTabIcon(slot: string): string {
  return cdn(`images/shop/catalog/catalog_shop_tab_icon_${slot}.png`);
}

export function shopTabEdgeOverlay(): string {
  return cdn('images/shop/catalog/catalog_shop_tab_edge_overlay.png');
}

export function soulIcon(): string {
  return cdn('images/shop/catalog/price_currency.png');
}

export function heroCardBacker(): string {
  return cdn('images/main_menu/pick_screen/card_backer.png');
}

export function heroCardBorder(): string {
  return cdn('images/main_menu/pick_screen/card_border.png');
}

export function fontUrl(name: string): string {
  return cdn(`fonts/${name}.otf`);
}
