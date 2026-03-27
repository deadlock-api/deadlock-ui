import { getAssetPath } from '@stencil/core';

function asset(path: string): string {
  return getAssetPath(`assets/${path}`);
}

export function cardBackground(slot: string, tier: number): string {
  return asset(`images/cards/card_${slot}_${tier}.png`);
}

export function tooltipHeaderBg(slot: string): string {
  return asset(`images/tooltips/tooltip_header_${slot}.png`);
}

export function tooltipBodyBg(slot: string): string {
  return asset(`images/tooltips/tooltip_bg_${slot}.png`);
}

export function shopBackground(slot: string): string {
  const mapped = slot === 'spirit' ? 'tech' : slot;
  return asset(`images/shop/shop_bg_${mapped}.webp`);
}

export function shopTabIcon(slot: string, active: boolean): string {
  const mapped = slot === 'spirit' ? 'tech' : slot;
  const suffix = active ? '_open' : '';
  return asset(`images/shop/shop_tab_${mapped}${suffix}.png`);
}

export function soulIcon(): string {
  return asset('icons/icon_soul.svg');
}
