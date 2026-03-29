# dl-provider



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute              | Description                                                                                                                                     | Type                                                                                                                                                                                                                                                                   | Default       |
| --------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `language`            | `language`             | Language for item data (e.g. `"english"`, `"brazilian"`, `"japanese"`).                                                                         | `Language.CS \| Language.DE \| Language.EN \| Language.ES \| Language.ES_LA \| Language.FR \| Language.ID \| Language.IT \| Language.JA \| Language.KO \| Language.PL \| Language.PT_BR \| Language.RU \| Language.TH \| Language.TR \| Language.UK \| Language.ZH_CN` | `Language.EN` |
| `showTierBadge`       | `show-tier-badge`      | Show tier badge on item cards globally. Individual cards can override this.                                                                     | `boolean`                                                                                                                                                                                                                                                              | `true`        |
| `tooltipTrigger`      | `tooltip-trigger`      | How the item tooltip is triggered: `"hover"` on mouse over, `"click"` on click, or `"none"` to disable.                                        | `"click" \| "hover" \| "none"`                                                                                                                                                                                                                                         | `'hover'`     |
| `tooltipPlacement`    | `tooltip-placement`    | Preferred tooltip position. `"auto"` picks the side with the most space.                                                                       | `"auto" \| "bottom" \| "left" \| "right" \| "top"`                                                                                                                                                                                                                     | `'auto'`      |
| `tooltipFollowCursor` | `tooltip-follow-cursor`| When `true`, the tooltip follows the cursor instead of anchoring to the card. Only applies when `tooltip-trigger` is `"hover"`.                 | `boolean`                                                                                                                                                                                                                                                              | `false`       |
| `tooltipDelay`        | `tooltip-delay`        | Delay in milliseconds before showing the tooltip on hover.                                                                                     | `number`                                                                                                                                                                                                                                                               | `150`         |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
