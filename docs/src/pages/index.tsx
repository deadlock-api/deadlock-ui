import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

const API_URL = 'https://assets.deadlock-api.com/v2/items?language=english';
const CARD_COUNT = 6;

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

const FALLBACK_ITEMS = [
  'upgrade_clip_size',
  'upgrade_health_regen',
  'upgrade_spirit_strike',
  'upgrade_bullet_lifesteal',
  'upgrade_rapid_rounds',
  'upgrade_enduring_speed',
];

function Home(): React.JSX.Element {
  const [items, setItems] = useState<string[]>(FALLBACK_ITEMS);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        const shopable = data.filter(
          (i: any) => i.shopable && !i.disabled && i.type === 'upgrade' && i.item_tier >= 1 && i.item_tier <= 4,
        );
        const picked = pickRandom(shopable, CARD_COUNT);
        setItems(picked.map((i: any) => i.class_name));
      })
      .catch(() => {});
  }, []);

  const vanillaExample = `<script type="module"
  src="https://unpkg.com/@deadlock-ui/core/dist/main/main.esm.js">
</script>

${items.map(name => `<dl-item-card class-name="${name}"></dl-item-card>`).join('\n')}`;

  const reactExample = `import { DlProvider, DlItemCard } from '@deadlock-ui/react';

function App() {
  return (
    <DlProvider language="english">
${items.map(name => `      <DlItemCard className="${name}" />`).join('\n')}
    </DlProvider>
  );
}`;

  const vueExample = `<script setup>
import { DlProvider, DlItemCard } from '@deadlock-ui/vue';
</script>

<template>
  <DlProvider language="english">
${items.map(name => `    <DlItemCard class-name="${name}" />`).join('\n')}
  </DlProvider>
</template>`;

  return (
    <Layout description="Open-source Web Components for Deadlock game items">
      <main style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 60px)',
        padding: '48px 24px',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '8px' }}>Deadlock UI</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--ifm-color-emphasis-600)', maxWidth: '600px', marginBottom: '32px' }}>
          Open-source Web Components for Deadlock game items.
          Use anywhere: plain HTML, React, Vue, or any framework.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '48px' }}>
          <Link className="button button--primary button--lg" to="/docs/getting-started">
            Get Started
          </Link>
          <Link className="button button--outline button--lg" to="/playground">
            Playground
          </Link>
        </div>

        <div style={{
          background: '#0d1117',
          borderRadius: '0.75rem',
          padding: '32px',
          border: '1px solid #21262d',
          maxWidth: '700px',
          width: '100%',
        }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
            {items.map(name => (
              // @ts-ignore
              <dl-item-card key={name} class-name={name} hover-effect="scale"></dl-item-card>
            ))}
          </div>

          <div style={{ textAlign: 'left' }}>
            <Tabs groupId="framework" defaultValue="react">
              <TabItem value="react" label="React">
                <CodeBlock language="tsx">
                  {reactExample}
                </CodeBlock>
              </TabItem>
              <TabItem value="vue" label="Vue">
                <CodeBlock language="html">
                  {vueExample}
                </CodeBlock>
              </TabItem>
              <TabItem value="vanilla" label="Web components">
                <CodeBlock language="html">
                  {vanillaExample}
                </CodeBlock>
              </TabItem>
            </Tabs>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default Home;
