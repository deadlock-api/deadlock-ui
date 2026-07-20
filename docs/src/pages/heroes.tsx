import React, { useEffect, useMemo, useState } from 'react';
import Layout from '@theme/Layout';

const HEROES_API_URL = 'https://api.deadlock-api.com/v1/assets/heroes?language=english&only_active=true';

interface HeroEntry {
  id: number;
  class_name: string;
  name: string;
}

function MinimapIcon({ className }: { className: string }) {
  return React.createElement('dl-hero-minimap-icon', {
    'class-name': className,
    style: { flexShrink: 0 },
  });
}

function Heroes(): React.JSX.Element {
  const [heroes, setHeroes] = useState<HeroEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch(HEROES_API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load heroes: ${res.status}`);
        return res.json();
      })
      .then((data: Array<{ id: number; class_name: string; name: string; player_selectable?: boolean; disabled?: boolean; in_development?: boolean }>) => {
        if (cancelled) return;
        setHeroes(
          data
            .filter((h) => h.player_selectable && !h.disabled && !h.in_development)
            .map((h) => ({ id: h.id, class_name: h.class_name, name: h.name }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load heroes');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!search) return heroes;
    const q = search.toLowerCase();
    return heroes.filter(
      (h) => h.class_name.includes(q) || h.name.toLowerCase().includes(q) || String(h.id) === q,
    );
  }, [search, heroes]);

  return (
    <Layout title="Heroes" description="All available heroes for Deadlock UI components">
      <main style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Heroes</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)', marginBottom: '8px' }}>
          Use these values in the <code>class-name</code>, <code>hero-id</code> or <code>hero-name</code> attributes of{' '}
          <code>&lt;dl-hero-card&gt;</code> and <code>&lt;dl-hero-minimap-icon&gt;</code>.
        </p>
        <p style={{ color: 'var(--ifm-color-emphasis-500)', marginBottom: '24px', fontSize: '14px' }}>
          {error ?? (heroes.length === 0 ? 'Loading heroes from the Deadlock API...' : `${heroes.length} playable heroes, fetched live from the Deadlock API.`)}
        </p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by class name, hero name or ID..."
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

        {heroes.length > 0 && (
          <p style={{ color: 'var(--ifm-color-emphasis-500)', fontSize: '13px', marginBottom: '16px' }}>
            Showing {filtered.length} of {heroes.length} heroes
          </p>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '8px',
        }}>
          {filtered.map((hero) => (
            <div
              key={hero.class_name}
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
              <MinimapIcon className={hero.class_name} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>{hero.class_name}</code>
                <div style={{ display: 'flex', gap: '6px', marginTop: '2px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '12px' }}>{hero.name}</span>
                  <span style={{ fontSize: '10px', color: 'var(--ifm-color-emphasis-500)' }}>
                    ID {hero.id}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
}

export default Heroes;
