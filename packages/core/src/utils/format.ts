import { ItemProperty } from '../types';

export function formatPropertyValue(prop: ItemProperty): string {
  if (prop.value === null || prop.value === undefined) return '';
  const val = String(prop.value);
  const prefix = prop.prefix?.replace('{s:sign}', Number(val) >= 0 ? '+' : '') ?? '';
  const postfix = prop.postfix ?? '';
  return `${prefix}${val}${postfix}`;
}

export function isPropertyVisible(prop: ItemProperty): boolean {
  if (prop.value === null || prop.value === undefined) return false;
  if (prop.disable_value !== undefined && prop.disable_value !== null) {
    return String(prop.value) !== String(prop.disable_value);
  }
  return String(prop.value) !== '0';
}

export function formatCost(cost: number | undefined): string {
  if (!cost) return '';
  return cost.toLocaleString();
}

export function getSlotColor(slotType: string): string {
  const colors: Record<string, string> = {
    weapon: '#cc8932',
    vitality: '#6dc04b',
    spirit: '#c878f0',
  };
  return colors[slotType] ?? '#8b9bae';
}
