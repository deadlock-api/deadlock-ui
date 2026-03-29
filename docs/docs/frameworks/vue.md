---
sidebar_position: 2
---

# Vue

## Install

```bash
npm install @deadlock-ui/vue
```

## Usage

```html
<script setup>
import { DlProvider, DlItemCard, DlShopPanel } from '@deadlock-ui/vue';
</script>

<template>
  <DlProvider language="english" tooltip-trigger="hover">
    <DlItemCard class-name="upgrade_clip_size" hover-effect="scale" />
    <DlShopPanel active-tab="spirit" />
  </DlProvider>
</template>
```

All props are fully typed. Your editor will provide autocomplete for every attribute.
