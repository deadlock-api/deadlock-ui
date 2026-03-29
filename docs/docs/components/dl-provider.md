---
sidebar_position: 1
---

# dl-provider

Global configuration wrapper. All child components inherit these settings.

## Usage

```html
<dl-provider
  language="english"
  tooltip-trigger="hover"
  tooltip-placement="auto"
  tooltip-delay="150"
  show-tier-badge="true">

  <!-- child components here -->

</dl-provider>
```

## Properties

| Attribute | Type | Default | Description |
|---|---|---|---|
| `language` | [`Language`](/docs/types#language) | `"english"` | Language for item data |
| `tooltip-trigger` | `"hover"` \| `"click"` \| `"none"` | `"hover"` | `hover` shows on mouse over, `click` on click, `none` disables |
| `tooltip-placement` | `"auto"` \| `"top"` \| `"bottom"` \| `"left"` \| `"right"` | `"auto"` | Preferred tooltip position |
| `tooltip-follow-cursor` | `boolean` | `false` | When `true`, tooltip follows the cursor instead of anchoring to the card. Only applies when `tooltip-trigger` is `"hover"` |
| `tooltip-delay` | `number` | `150` | Delay in ms before showing tooltip on hover |
| `show-tier-badge` | `boolean` | `true` | Show tier badge on item cards globally |
