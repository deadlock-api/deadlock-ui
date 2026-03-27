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

export function tooltipBodyBg(slot: string): string {
  return cdn(`images/shop/catalog/catalog_tooltip_bg_${slot}.png`);
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
  return cdn('icons/icon_soul.svg');
}
