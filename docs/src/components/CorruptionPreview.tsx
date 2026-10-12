import React, { useEffect, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

interface ItemOption {
  id: number;
  name: string;
  tier: number;
}

const ITEMS_API_URL = 'https://api.deadlock-api.com/v1/assets/items?language=english';
// Spellbreaker as player slot 2 had it in match 110932323
const DEFAULT_ITEM_ID = 1955841979;
const MATCH_SEED = '658605123';
const PENALTY_NAMES = [
  'TechCooldown',
  'TechRange',
  'Stamina',
  'MoveSpeed',
  'FireRate',
  'TechDuration',
  'TechPower',
  'WeaponDamage',
  'Health',
  'BulletResist',
  'TechResist',
];

let itemsCache: Promise<ItemOption[]> | null = null;

/** Items the Broker can corrupt: tier 3 and tier 4 shop items. */
function fetchItemOptions(): Promise<ItemOption[]> {
  if (itemsCache) return itemsCache;

  itemsCache = fetch(ITEMS_API_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load items: ${res.status}`);
      return res.json();
    })
    .then((items: Array<{ id: number; name: string; item_tier: number; corrupted_info?: unknown; shopable?: boolean; disabled?: boolean }>) =>
      items
        .filter((i) => i.corrupted_info && i.shopable !== false && !i.disabled)
        .map((i) => ({ id: i.id, name: i.name, tier: i.item_tier }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    )
    .catch((err) => {
      itemsCache = null;
      throw err;
    });

  return itemsCache;
}

const controlStyle: React.CSSProperties = {
  padding: '4px 10px',
  borderRadius: 6,
  border: '1px solid var(--ifm-color-emphasis-300)',
  background: 'var(--ifm-background-color)',
  color: 'var(--ifm-font-color-base)',
  fontSize: 13,
  cursor: 'pointer',
};

const labelStyle: React.CSSProperties = { fontSize: 13, color: 'var(--ifm-color-emphasis-700)' };

function CorruptionPreviewInner() {
  const [items, setItems] = useState<ItemOption[]>([]);
  const [itemId, setItemId] = useState(DEFAULT_ITEM_ID);
  const [penalty, setPenalty] = useState('WeaponDamage');

  useEffect(() => {
    let cancelled = false;
    fetchItemOptions().then((options) => !cancelled && setItems(options)).catch(() => {
      // silently fail; the preview keeps the default item without the select
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards: { caption: string; attributes: Record<string, string> }[] = [
    { caption: 'normal', attributes: {} },
    { caption: 'corrupted', attributes: { corrupted: '' } },
    { caption: `corrupted="${penalty}"`, attributes: { corrupted: penalty } },
    { caption: `corrupted + seed ${MATCH_SEED}`, attributes: { corrupted: '', 'corrupted-penalty-seed': MATCH_SEED } },
  ];

  return (
    <div style={{ marginBottom: '1rem' }}>
      {items.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={labelStyle}>Item:</span>
          <select aria-label="Item" value={itemId} style={controlStyle} onChange={(e) => setItemId(Number(e.target.value))}>
            {items.map((item) => (
              <option key={item.id} value={item.id}>{item.name} (T{item.tier})</option>
            ))}
          </select>
          <span style={labelStyle}>Downside:</span>
          <select aria-label="Downside" value={penalty} style={controlStyle} onChange={(e) => setPenalty(e.target.value)}>
            {PENALTY_NAMES.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      )}
      <div className="component-preview">
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          {cards.map(({ caption, attributes }) => (
            <div key={`${itemId}-${caption}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {React.createElement('dl-item-card', { 'item-id': String(itemId), 'hover-effect': 'scale', ...attributes })}
              <p style={{ color: '#8b949e', fontSize: 12, marginTop: 8 }}>
                <code>{caption}</code>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CorruptionPreview() {
  return (
    <BrowserOnly fallback={<div className="component-preview" />}>
      {() => <CorruptionPreviewInner />}
    </BrowserOnly>
  );
}
