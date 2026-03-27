---
sidebar_position: 1
---

# React

## Install

```bash
npm install @deadlock-ui/react
```

## Usage

```tsx
import { DlProvider, DlItemCard, DlShopPanel } from '@deadlock-ui/react';

function App() {
  return (
    <DlProvider language="english" tooltipBehavior="tooltip">
      <DlItemCard className="upgrade_clip_size" hoverEffect="scale" />
      <DlShopPanel activeTab="spirit" />
    </DlProvider>
  );
}
```

All props are fully typed. Your editor will provide autocomplete for every attribute.
