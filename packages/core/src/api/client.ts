import { Item, ItemSlotType, Language } from '../types';

const API_BASE = 'https://assets.deadlock-api.com/v2';

const cache = new Map<Language, Promise<Item[]>>();

let genericDataCache: Promise<GenericData> | null = null;

export interface GenericData {
  item_price_per_tier: number[];
}

export function fetchGenericData(): Promise<GenericData> {
  if (genericDataCache) return genericDataCache;

  genericDataCache = fetch(`${API_BASE}/generic-data`)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load generic data: ${res.status}`);
      return res.json();
    })
    .catch(err => {
      genericDataCache = null;
      throw err;
    });

  return genericDataCache;
}

function loadItems(language: Language): Promise<Item[]> {
  const cached = cache.get(language);
  if (cached) return cached;

  const promise = fetch(`${API_BASE}/items?language=${language}`)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load items: ${res.status} ${res.statusText}`);
      return res.json();
    })
    .catch(err => {
      cache.delete(language);
      throw err;
    });

  cache.set(language, promise);
  return promise;
}

export async function fetchItems(language: Language = Language.EN): Promise<Item[]> {
  return loadItems(language);
}

export async function fetchItemsBySlotType(
  slotType: ItemSlotType,
  language: Language = Language.EN,
): Promise<Item[]> {
  const items = await loadItems(language);
  return items.filter(i => i.item_slot_type === slotType);
}

export async function fetchItem(
  idOrClassName: string | number,
  language: Language = Language.EN,
): Promise<Item> {
  const items = await loadItems(language);
  const item = items.find(
    i => typeof idOrClassName === 'number'
      ? i.id === idOrClassName
      : i.class_name === idOrClassName,
  );
  if (!item) throw new Error(`Item not found: ${idOrClassName}`);
  return item;
}
