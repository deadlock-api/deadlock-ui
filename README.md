# Deadlock UI

> **Work in progress** — This project is under active development. APIs, components, and documentation may change without notice.

Open-source Web Components for [Deadlock](https://store.steampowered.com/app/1422450/Deadlock/) game items. Use anywhere: plain HTML, React, Vue, or any framework.

Item data and images are fetched directly from the [Deadlock API](https://deadlock-api.com/) — no local assets or configuration needed.

## Packages

| Package | Description |
|---|---|
| [`@deadlock-ui/core`](packages/core) | Web Components built with StencilJS |
| [`@deadlock-ui/react`](packages/react) | React bindings |
| [`@deadlock-ui/vue`](packages/vue) | Vue bindings |

## Quick Start

### HTML

```html
<script type="module" src="https://unpkg.com/@deadlock-ui/core/dist/main/main.esm.js"></script>

<dl-provider language="english">
  <dl-item-card class-name="upgrade_clip_size"></dl-item-card>
</dl-provider>
```

### React

```bash
npm install @deadlock-ui/react
```

```jsx
import { DlProvider, DlItemCard } from '@deadlock-ui/react';

function App() {
  return (
    <DlProvider language="english">
      <DlItemCard className="upgrade_clip_size" />
    </DlProvider>
  );
}
```

### Vue

```bash
npm install @deadlock-ui/vue
```

```vue
<script setup>
import { DlProvider, DlItemCard } from '@deadlock-ui/vue';
</script>

<template>
  <DlProvider language="english">
    <DlItemCard class-name="upgrade_clip_size" />
  </DlProvider>
</template>
```

## Components

- **`<dl-provider>`** — Global configuration wrapper (language, tooltip behavior, placement)
- **`<dl-item-card>`** — Single item card with tooltip
- **`<dl-shop-panel>`** — Full item shop with category tabs and tier sections

See the [documentation](https://ui-docs.deadlock.pro.br) for full component API and examples.

## Supported Languages

brazilian, czech, english, french, german, indonesian, italian, japanese, koreana, latam, polish, russian, schinese, spanish, thai, turkish, ukrainian

## Development

```bash
npm install
npm run dev
```

## License

MIT
