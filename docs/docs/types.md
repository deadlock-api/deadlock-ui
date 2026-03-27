---
sidebar_position: 2
---

# Types

All types are exported from the core package and can be imported directly:

```ts
import type { Language, Item, TooltipBehavior } from '@deadlock-ui/core';
```

## Language

Supported language codes for item data localization. Used by [`dl-provider`](/docs/components/dl-provider).

| Value | Language |
|---|---|
| `brazilian` | Brazilian Portuguese |
| `czech` | Czech |
| `english` | English |
| `french` | French |
| `german` | German |
| `indonesian` | Indonesian |
| `italian` | Italian |
| `japanese` | Japanese |
| `koreana` | Korean |
| `latam` | Latin American Spanish |
| `polish` | Polish |
| `russian` | Russian |
| `schinese` | Simplified Chinese |
| `spanish` | Spanish |
| `thai` | Thai |
| `turkish` | Turkish |
| `ukrainian` | Ukrainian |

A runtime array `SUPPORTED_LANGUAGES` is also available:

```ts
import { SUPPORTED_LANGUAGES } from '@deadlock-ui/core';

console.log(SUPPORTED_LANGUAGES);
// ['brazilian', 'czech', 'english', ...]
```

## TooltipBehavior

Controls how the item tooltip is triggered.

| Value | Description |
|---|---|
| `tooltip` | Shows on hover |
| `popover` | Shows on click |
| `none` | Disabled |

## TooltipPlacement

Preferred tooltip position.

| Value | Description |
|---|---|
| `auto` | Picks the side with the most space |
| `top` | Above the element |
| `bottom` | Below the element |
| `left` | Left of the element |
| `right` | Right of the element |
