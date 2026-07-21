/**
 * Fetches all shop items from the Deadlock API and generates the JSON catalog
 * for docs (docs/src/data/items.json).
 *
 * The HeroClassName / ItemClassName types are template literal types
 * (`hero_${string}` / `upgrade_${string}`), so no type generation is needed.
 *
 * Usage: node scripts/generate-class-names.mjs
 */

import repoConfig from '../repo.config.mjs';

const ITEMS_API_URL = repoConfig.apiItemsUrl;
const ITEMS_JSON_OUTPUT = new URL('../docs/src/data/items.json', import.meta.url);

const { writeFileSync, mkdirSync } = await import('node:fs');
const { fileURLToPath } = await import('node:url');
const { dirname } = await import('node:path');

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API request failed: ${res.status}`);
  return res.json();
}

// --- Items ---
const allItems = await fetchJson(ITEMS_API_URL);
const items = allItems.filter((i) => i.type === 'upgrade' && i.shopable);

const itemsCatalog = items
  .map((i) => ({
    class_name: i.class_name,
    name: i.name,
    type: i.type,
    item_slot_type: i.item_slot_type,
    item_tier: i.item_tier,
    image: i.shop_image_webp || i.shop_image || i.image_webp || i.image || null,
  }))
  .sort((a, b) => a.class_name.localeCompare(b.class_name));

const itemsJsonPath = fileURLToPath(ITEMS_JSON_OUTPUT);
mkdirSync(dirname(itemsJsonPath), { recursive: true });
writeFileSync(itemsJsonPath, JSON.stringify(itemsCatalog, null, 2) + '\n');

console.log(`Generated ${itemsCatalog.length} items catalog  -> docs/src/data/items.json`);

