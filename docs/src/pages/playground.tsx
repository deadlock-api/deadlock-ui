import React, { useState } from 'react';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';

const LANGUAGES = [
  'brazilian', 'czech', 'english', 'french', 'german', 'indonesian',
  'italian', 'japanese', 'koreana', 'latam', 'polish', 'russian',
  'schinese', 'spanish', 'thai', 'turkish', 'ukrainian',
];

const selectStyle: React.CSSProperties = {
  background: '#151b23',
  color: '#e6edf3',
  border: '1px solid #21262d',
  padding: '6px 10px',
  borderRadius: '6px',
  fontSize: '13px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#8b949e',
};

function Playground(): React.JSX.Element {
  const [language, setLanguage] = useState('english');
  const [tooltipBehavior, setTooltipBehavior] = useState('tooltip');
  const [tooltipPlacement, setTooltipPlacement] = useState('auto');
  const [tooltipDelay, setTooltipDelay] = useState(150);
  const [showTierBadge, setShowTierBadge] = useState(false);
  const [activeTab, setActiveTab] = useState('weapon');
  const [hoverEffect, setHoverEffect] = useState('scale');
  const [key, setKey] = useState(0);

  // Force re-render when language changes (web components need remount)
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setKey(k => k + 1);
  };

  return (
    <Layout title="Playground" description="Test Deadlock UI components live">
      <main style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Playground</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)', marginBottom: '24px' }}>
          Configure and test Deadlock UI components live.
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '32px',
          padding: '16px',
          background: 'var(--ifm-background-surface-color)',
          borderRadius: '8px',
          border: '1px solid var(--ifm-color-emphasis-200)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={labelStyle}>Language:</label>
            <select style={selectStyle} value={language} onChange={e => handleLanguageChange(e.target.value)}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={labelStyle}>Tooltip:</label>
            <select style={selectStyle} value={tooltipBehavior} onChange={e => setTooltipBehavior(e.target.value)}>
              <option value="tooltip">Hover</option>
              <option value="popover">Click</option>
              <option value="none">Disabled</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={labelStyle}>Placement:</label>
            <select style={selectStyle} value={tooltipPlacement} onChange={e => setTooltipPlacement(e.target.value)}>
              <option value="auto">Auto</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={labelStyle}>Delay:</label>
            <input
              type="number"
              style={{ ...selectStyle, width: '70px' }}
              value={tooltipDelay}
              min={0}
              max={1000}
              step={50}
              onChange={e => setTooltipDelay(Number(e.target.value))}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={labelStyle}>Tier Badge:</label>
            <input
              type="checkbox"
              checked={showTierBadge}
              onChange={e => setShowTierBadge(e.target.checked)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={labelStyle}>Active Tab:</label>
            <select style={selectStyle} value={activeTab} onChange={e => setActiveTab(e.target.value)}>
              <option value="weapon">Weapon</option>
              <option value="vitality">Vitality</option>
              <option value="spirit">Spirit</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={labelStyle}>Hover Effect:</label>
            <select style={selectStyle} value={hoverEffect} onChange={e => setHoverEffect(e.target.value)}>
              <option value="scale">Scale</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>

        <h2>Shop Panel</h2>
        <div className="component-preview" key={`shop-${key}`}>
          {/* @ts-ignore */}
          <dl-provider
            language={language}
            tooltip-behavior={tooltipBehavior}
            tooltip-placement={tooltipPlacement}
            tooltip-delay={tooltipDelay}
            show-tier-badge={showTierBadge.toString()}
          >
            {/* @ts-ignore */}
            <dl-shop-panel active-tab={activeTab} hover-effect={hoverEffect}></dl-shop-panel>
          </dl-provider>
        </div>

        <h2 style={{ marginTop: '32px' }}>Generated Code</h2>
        <CodeBlock language="html" title="Usage">
{`<dl-provider
  language="${language}"
  tooltip-behavior="${tooltipBehavior}"
  tooltip-placement="${tooltipPlacement}"
  tooltip-delay="${tooltipDelay}"
  show-tier-badge="${showTierBadge}">

  <dl-shop-panel${activeTab !== 'weapon' ? ` active-tab="${activeTab}"` : ''}${hoverEffect !== 'scale' ? ` hover-effect="${hoverEffect}"` : ''}></dl-shop-panel>

</dl-provider>`}
        </CodeBlock>
      </main>
    </Layout>
  );
}

export default Playground;
