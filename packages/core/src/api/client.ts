import {
  CorruptedItemImages,
  CorruptedPenalty,
  CorruptionConfig,
  Hero,
  HeroClassName,
  Item,
  ItemClassName,
  ItemSlotType,
  Language,
} from '../types';
import { CORRUPTION_CONFIG } from '../utils/corruption';

const API_BASE = 'https://api.deadlock-api.com/v1/assets';

const cache = new Map<Language, Promise<Item[]>>();

const heroCache = new Map<Language, Promise<Hero[]>>();

let genericDataCache: Promise<GenericData> | null = null;

export interface GenericData {
  item_price_per_tier: number[];
  item_corruption_price_per_tier?: number[];
  corrupted_penalties?: CorruptedPenalty[];
  corrupted_item_images?: CorruptedItemImages;
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

const CORRUPTION_CONVARS: Record<keyof CorruptionConfig, string> = {
  bonusVarianceBetter: 'citadel_corrupted_item_bonus_variance_better',
  bonusVarianceWorse: 'citadel_corrupted_item_bonus_variance_worse',
  penaltyVariance: 'citadel_corrupted_penalty_variance',
};

let corruptionConfigCache: Promise<CorruptionConfig> | null = null;

function fetchConvarDefault(name: string): Promise<number> {
  return fetch(`${API_BASE}/convars/${name}`)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load convar ${name}: ${res.status}`);
      return res.json();
    })
    .then((convar: { default?: unknown }) => {
      if (typeof convar.default !== 'number') throw new Error(`Convar ${name} is not a number`);
      return convar.default;
    });
}

/**
 * Per-match variance of corrupted items, read from the game's convars. A convar that fails to load keeps
 * its value from `CORRUPTION_CONFIG`, and the next call tries to load it again.
 */
export function fetchCorruptionConfig(): Promise<CorruptionConfig> {
  if (corruptionConfigCache) return corruptionConfigCache;

  const keys = Object.keys(CORRUPTION_CONVARS) as (keyof CorruptionConfig)[];
  corruptionConfigCache = Promise.allSettled(keys.map(key => fetchConvarDefault(CORRUPTION_CONVARS[key])))
    .then(results => {
      const config: CorruptionConfig = { ...CORRUPTION_CONFIG };
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') config[keys[i]] = result.value;
      });
      if (results.some(result => result.status === 'rejected')) corruptionConfigCache = null;
      return config;
    });

  return corruptionConfigCache;
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
  idOrClassName: ItemClassName | number,
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

function loadHeroes(language: Language): Promise<Hero[]> {
  const cached = heroCache.get(language);
  if (cached) return cached;

  const promise = fetch(`${API_BASE}/heroes?language=${language}`)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load heroes: ${res.status} ${res.statusText}`);
      return res.json();
    })
    .catch(err => {
      heroCache.delete(language);
      throw err;
    });

  heroCache.set(language, promise);
  return promise;
}

export async function fetchHeroes(language: Language = Language.EN): Promise<Hero[]> {
  return loadHeroes(language);
}

function findHero(heroes: Hero[], idOrName: string | number): Hero | undefined {
  if (typeof idOrName === 'number') {
    return heroes.find(h => h.id === idOrName);
  }
  const lower = idOrName.toLowerCase();
  return (
    heroes.find(h => h.class_name === idOrName)
    ?? heroes.find(h => h.name.toLowerCase() === lower)
  );
}

export async function fetchHero(
  idOrName: HeroClassName | string | number,
  language: Language = Language.EN,
): Promise<Hero> {
  const heroes = await loadHeroes(language);
  let hero = findHero(heroes, idOrName);
  if (!hero && typeof idOrName === 'string' && language !== Language.EN) {
    // English display names should resolve even when the list is localized
    const enHero = findHero(await loadHeroes(Language.EN), idOrName);
    if (enHero) hero = heroes.find(h => h.id === enHero.id);
  }
  if (!hero) throw new Error(`Hero not found: ${idOrName}`);
  return hero;
}
