import React, { useEffect, useRef, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import CodeBlock from '@theme/CodeBlock';

interface HeroPreviewProps {
  /**
   * Markup rendered in the preview and shown as copyable code.
   * Single-hero mode: every `__HERO__` placeholder is replaced by the selected
   * hero's class name and a hero select is shown.
   * Multi-hero mode: `__HERO<n>_CLASS__`, `__HERO<n>_NAME__` and `__HERO<n>_ID__`
   * placeholders are each resolved against the n-th randomly picked hero and a
   * shuffle button is shown.
   */
  template: string;
  previewStyle?: React.CSSProperties;
}

interface HeroOption {
  id: number;
  class_name: string;
  name: string;
}

const HEROES_API_URL = 'https://api.deadlock-api.com/v1/assets/heroes?language=english&only_active=true';
const MULTI_PLACEHOLDER = /__HERO(\d+)_(CLASS|NAME|ID)__/g;

let heroesCache: Promise<HeroOption[]> | null = null;

function fetchHeroOptions(): Promise<HeroOption[]> {
  if (heroesCache) return heroesCache;

  heroesCache = fetch(HEROES_API_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load heroes: ${res.status}`);
      return res.json();
    })
    .then((heroes: Array<{ id: number; class_name: string; name: string; player_selectable?: boolean; disabled?: boolean; in_development?: boolean }>) =>
      heroes
        .filter((h) => h.player_selectable && !h.disabled && !h.in_development)
        .map((h) => ({ id: h.id, class_name: h.class_name, name: h.name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    )
    .catch((err) => {
      heroesCache = null;
      throw err;
    });

  return heroesCache;
}

function pickDistinct(options: HeroOption[], count: number): HeroOption[] {
  const pool = [...options];
  const picks: HeroOption[] = [];
  while (picks.length < count && pool.length > 0) {
    picks.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return picks;
}

function multiSlotCount(template: string): number {
  let max = 0;
  for (const match of template.matchAll(MULTI_PLACEHOLDER)) {
    max = Math.max(max, Number(match[1]));
  }
  return max;
}

function resolveTemplate(template: string, hero: string | null, picks: HeroOption[]): string {
  if (hero) return template.split('__HERO__').join(hero).trim();
  if (picks.length === 0) return '';
  return template
    .replace(MULTI_PLACEHOLDER, (_, index, field) => {
      const pick = picks[Number(index) - 1] ?? picks[0];
      if (field === 'NAME') return pick.name;
      if (field === 'ID') return String(pick.id);
      return pick.class_name;
    })
    .trim();
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

function HeroPreviewInner({ template, previewStyle }: HeroPreviewProps) {
  const slots = multiSlotCount(template);
  const [heroes, setHeroes] = useState<HeroOption[]>([]);
  const [hero, setHero] = useState<string | null>(null);
  const [picks, setPicks] = useState<HeroOption[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHeroOptions().then((options) => {
      if (cancelled || options.length === 0) return;
      setHeroes(options);
      if (slots > 0) {
        setPicks(pickDistinct(options, slots));
      } else {
        setHero(options[Math.floor(Math.random() * options.length)].class_name);
      }
    }).catch(() => {
      // silently fail; the preview stays empty without the hero list
    });
    return () => {
      cancelled = true;
    };
  }, [slots]);

  const html = resolveTemplate(template, hero, picks);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = html;
  }, [html]);

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {slots > 0 ? (
          <button
            style={controlStyle}
            disabled={heroes.length === 0}
            onClick={() => setPicks(pickDistinct(heroes, slots))}
          >
            Shuffle heroes
          </button>
        ) : (
          <>
            <span style={{ fontSize: 13, color: 'var(--ifm-color-emphasis-700)' }}>Hero:</span>
            <select
              aria-label="Hero"
              value={hero ?? ''}
              disabled={heroes.length === 0}
              onChange={(e) => setHero(e.target.value)}
              style={controlStyle}
            >
              {heroes.length === 0 && <option value="">Loading...</option>}
              {heroes.map((h) => (
                <option key={h.class_name} value={h.class_name}>
                  {h.name}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
      <div
        className="component-preview"
        style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          padding: '32px 16px 16px',
          background: '#101010',
          borderRadius: 6,
          ...previewStyle,
        }}
        ref={ref}
      />
      <div style={{ marginTop: 8 }}>
        <CodeBlock language="html">{html}</CodeBlock>
      </div>
    </div>
  );
}

export default function HeroPreview(props: HeroPreviewProps) {
  return (
    <BrowserOnly fallback={<div className="component-preview" />}>
      {() => <HeroPreviewInner {...props} />}
    </BrowserOnly>
  );
}
