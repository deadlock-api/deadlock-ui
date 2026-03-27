# deadlock-ui

Web Components for [Deadlock](https://store.steampowered.com/app/1422450/Deadlock/) game items UI. Built with [StencilJS](https://stenciljs.com/).

Item data and images are fetched directly from the [Deadlock API](https://assets.deadlock-api.com/) — no local assets or configuration needed.

## Install

```bash
npm install deadlock-ui
```

## Usage

Load the script and wrap your components with `<dl-provider>`:

```html
<script type="module" src="https://unpkg.com/deadlock-ui/dist/main/main.esm.js"></script>

<dl-provider language="english">
  <dl-item-card class-name="upgrade_clip_size"></dl-item-card>
</dl-provider>
```

Or render the full shop panel:

```html
<dl-provider language="english">
  <dl-shop-panel></dl-shop-panel>
</dl-provider>
```

## Components

### `<dl-provider>`

Global configuration wrapper. All child components inherit these settings.

| Attribute | Type | Default | Description |
|---|---|---|---|
| `language` | `string` | `"english"` | Language for item data |
| `tooltip-behavior` | `"tooltip"` \| `"popover"` \| `"none"` | `"tooltip"` | `tooltip` shows on hover, `popover` on click, `none` disables |
| `tooltip-placement` | `"auto"` \| `"top"` \| `"bottom"` \| `"left"` \| `"right"` | `"auto"` | Preferred tooltip position |
| `tooltip-delay` | `number` | `150` | Delay in ms before showing tooltip on hover |
| `show-tier-badge` | `boolean` | `true` | Show tier badge on item cards (global default) |

### `<dl-item-card>`

Displays a single item card with tooltip.

| Attribute | Type | Default | Description |
|---|---|---|---|
| `class-name` | `string` | — | Item class name (e.g. `"upgrade_clip_size"`) |
| `item-id` | `number` | — | Item ID (alternative to `class-name`) |
| `hover-effect` | `"none"` \| `"scale"` | `"none"` | Hover effect on the card |
| `show-tier-badge` | `boolean` | — | Override the global `show-tier-badge` for this card |

### `<dl-shop-panel>`

Displays the full item shop with category tabs (Weapon, Vitality, Spirit) and tier sections.

| Attribute | Type | Default | Description |
|---|---|---|---|
| `active-tab` | `"weapon"` \| `"vitality"` \| `"spirit"` | `"weapon"` | Initial active tab |
| `hover-effect` | `"none"` \| `"scale"` | `"scale"` | Hover effect on item cards |

## Supported languages

brazilian, czech, english, french, german, indonesian, italian, japanese, koreana, latam, polish, russian, schinese, spanish, thai, turkish, ukrainian

## License

MIT
