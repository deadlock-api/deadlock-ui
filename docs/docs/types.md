---
sidebar_position: 2
---

# Types

All types are exported from the core package and can be imported directly:

```ts
import type { Language, Item, TooltipTrigger } from '@deadlock-ui/core';
```

## Language

Enum with supported language codes for item data localization. Used by [`dl-provider`](/docs/components/dl-provider).

| Enum Key | Value | Language |
|---|---|---|
| `Language.PT_BR` | `brazilian` | Brazilian Portuguese |
| `Language.CS` | `czech` | Czech |
| `Language.EN` | `english` | English |
| `Language.FR` | `french` | French |
| `Language.DE` | `german` | German |
| `Language.ID` | `indonesian` | Indonesian |
| `Language.IT` | `italian` | Italian |
| `Language.JA` | `japanese` | Japanese |
| `Language.KO` | `koreana` | Korean |
| `Language.ES_LA` | `latam` | Latin American Spanish |
| `Language.PL` | `polish` | Polish |
| `Language.RU` | `russian` | Russian |
| `Language.ZH_CN` | `schinese` | Simplified Chinese |
| `Language.ES` | `spanish` | Spanish |
| `Language.TH` | `thai` | Thai |
| `Language.TR` | `turkish` | Turkish |
| `Language.UK` | `ukrainian` | Ukrainian |

```ts
import { Language, SUPPORTED_LANGUAGES } from '@deadlock-ui/core';

Language.EN;            // 'english'
Language.PT_BR;         // 'brazilian'
SUPPORTED_LANGUAGES;    // ['brazilian', 'czech', 'english', ...]
```

## TooltipTrigger

Controls how the item tooltip is triggered.

| Value | Description |
|---|---|
| `hover` | Shows on mouse hover |
| `click` | Shows on click |
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
