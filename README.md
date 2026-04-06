# Deadlock UI

> **Work in progress** — This project is under active development. APIs, components, and documentation may change without notice.

Open-source Web Components for [Deadlock](https://store.steampowered.com/app/1422450/Deadlock/) game items. Use anywhere: plain HTML, React, Vue, or any framework.

Item data and images are fetched directly from the [Deadlock API](https://deadlock-api.com/) — no local assets or configuration needed.

## Packages

| Package | Description |
|---|---|
| [`@deadlock-api/ui-core`](packages/core) | Web Components built with StencilJS |
| [`@deadlock-api/ui-react`](packages/react) | React bindings |
| [`@deadlock-api/ui-vue`](packages/vue) | Vue bindings |

## Quick Start

### HTML

```html
<script type="module" src="https://unpkg.com/@deadlock-api/ui-core/dist/main/main.esm.js"></script>

<dl-provider language="english">
  <dl-item-card class-name="upgrade_clip_size"></dl-item-card>
</dl-provider>
```

### React

```bash
npm install @deadlock-api/ui-react
```

```jsx
import { DlProvider, DlItemCard } from '@deadlock-api/ui-react';

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
npm install @deadlock-api/ui-vue
```

```vue
<script setup>
import { DlProvider, DlItemCard } from '@deadlock-api/ui-vue';
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

See the [documentation](https://ui.deadlock-api.com) for full component API and examples.

## Supported Languages

brazilian, czech, english, french, german, indonesian, italian, japanese, koreana, latam, polish, russian, schinese, spanish, thai, turkish, ukrainian

## Development

```bash
npm install
npm run dev
```

## License

MIT
