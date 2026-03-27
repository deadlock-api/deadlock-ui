import { getAssetPath } from '@stencil/core';

const CDN_BASE = 'https://assets-bucket.deadlock-api.com/assets-api-res';

function asset(path: string): string {
  return getAssetPath(`assets/${path}`);
}

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

export function shopTabIcon(slot: string, active: boolean): string {
  const mapped = slot === 'tech' ? 'spirit' : slot;
  const suffix = active ? '_open' : '';
  return asset(`images/shop/shop_tab_${mapped}${suffix}.png`);
}

export function soulIcon(): string {
  return cdn('icons/icon_soul.svg');
}
