import React, { useState, useMemo } from 'react';
import Layout from '@theme/Layout';
import items from '../data/items.json';

const SLOTS = ['all', 'weapon', 'vitality', 'spirit'] as const;
const TIERS = ['all', '1', '2', '3', '4'] as const;

const SLOT_COLORS: Record<string, string> = {
  weapon: '#d29e5a',
  spirit: '#b07fd6',
  vitality: '#6fb05c',
};

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: '6px',
        border: active ? '1px solid var(--ifm-color-primary)' : '1px solid var(--ifm-color-emphasis-300)',
        background: active ? 'var(--ifm-color-primary)' : 'transparent',
        color: active ? '#fff' : 'var(--ifm-font-color-base)',
        cursor: 'pointer',
        fontSize: '13px',
        textTransform: 'capitalize',
      }}
    >
      {label}
    </button>
  );
}

function ClassNames(): React.JSX.Element {
  const [search, setSearch] = useState('');
  const [slotFilter, setSlotFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (slotFilter !== 'all' && item.item_slot_type !== slotFilter) return false;
      if (tierFilter !== 'all' && String(item.item_tier) !== tierFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!item.class_name.includes(q) && !item.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, slotFilter, tierFilter]);

  return (
    <Layout title="Class Names" description="All available item class names for Deadlock UI components">
      <main style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Item Class Names</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)', marginBottom: '8px' }}>
          Use these values in the <code>class-name</code> attribute of <code>&lt;dl-item-card&gt;</code>.
        </p>
        <p style={{ color: 'var(--ifm-color-emphasis-500)', marginBottom: '24px', fontSize: '14px' }}>
          {items.length} shop items available. Generated from the Deadlock API.
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <input
            type="text"
            placeholder="Search by class name or item name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: '1 1 300px',
              background: 'var(--ifm-background-surface-color)',
              color: 'var(--ifm-font-color-base)',
              border: '1px solid var(--ifm-color-emphasis-300)',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--ifm-color-emphasis-600)' }}>Slot:</span>
            {SLOTS.map((s) => (
              <FilterButton key={s} label={s} active={slotFilter === s} onClick={() => setSlotFilter(s)} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--ifm-color-emphasis-600)' }}>Tier:</span>
            {TIERS.map((t) => (
              <FilterButton key={t} label={t === 'all' ? 'all' : `T${t}`} active={tierFilter === t} onClick={() => setTierFilter(t)} />
            ))}
          </div>
        </div>

        <p style={{ color: 'var(--ifm-color-emphasis-500)', fontSize: '13px', marginBottom: '16px' }}>
          Showing {filtered.length} of {items.length} items
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '8px',
        }}>
          {filtered.map((item) => (
            <div
              key={item.class_name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                background: 'var(--ifm-background-surface-color)',
                border: '1px solid var(--ifm-color-emphasis-200)',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  style={{ width: '28px', height: '28px', objectFit: 'contain', flexShrink: 0 }}
                />
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>{item.class_name}</code>
                <div style={{ display: 'flex', gap: '6px', marginTop: '2px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '12px' }}>{item.name}</span>
                  {item.item_slot_type && (
                    <span style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '3px',
                      background: (SLOT_COLORS[item.item_slot_type] || '#666') + '22',
                      color: SLOT_COLORS[item.item_slot_type] || '#666',
                    }}>
                      {item.item_slot_type}
                    </span>
                  )}
                  {item.item_tier && (
                    <span style={{
                      fontSize: '10px',
                      color: 'var(--ifm-color-emphasis-500)',
                    }}>
                      T{item.item_tier}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
}

export default ClassNames;
