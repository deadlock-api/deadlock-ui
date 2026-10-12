import { Component, Prop, Watch, h } from '@stencil/core';
import { Language, TooltipTrigger, TooltipPlacement } from '../../types';
import { configState } from '../../store/config-store';
import { injectFonts } from '../../utils/fonts';

@Component({
  tag: 'dl-provider',
  shadow: false,
})
export class DlProvider {
  /** Language for item data (e.g. `"english"`, `"brazilian"`, `"japanese"`). */
  @Prop() language: Language = Language.EN;

  /** How the item tooltip is triggered: `"hover"` on mouse over, `"click"` on click, or `"none"` to disable. */
  @Prop({ attribute: 'tooltip-trigger' }) tooltipTrigger: TooltipTrigger = 'hover';

  /** Preferred tooltip position. `"auto"` picks the side with the most space. */
  @Prop({ attribute: 'tooltip-placement' }) tooltipPlacement: TooltipPlacement = 'auto';

  /** When `true`, the tooltip follows the cursor instead of anchoring to the card. Only applies when `tooltip-trigger` is `"hover"`. */
  @Prop({ attribute: 'tooltip-follow-cursor' }) tooltipFollowCursor: boolean = false;

  /** Delay in milliseconds before showing the tooltip on hover. */
  @Prop({ attribute: 'tooltip-delay', reflect: true }) tooltipDelay: number = 100;

  /** Show tier badge on item cards globally. Individual cards can override this. */
  @Prop({ attribute: 'show-tier-badge' }) showTierBadge: boolean = true;

  /** Show numeric scaling multipliers in item tooltips. When false, only scaling icons and strength arrows are shown. */
  @Prop({ attribute: 'show-scaling-values' }) showScalingValues: boolean = false;

  /**
   * `match_info.corrupted_penalty_seed` of the match on the page, so corrupted item
   * cards show what they rolled in it. Shared by every card on the page; cards from
   * other matches set their own `corrupted-penalty-seed`.
   */
  @Prop({ attribute: 'corrupted-penalty-seed' }) corruptedPenaltySeed?: number;

  connectedCallback() {
    injectFonts();
    configState.language = this.language;
    configState.tooltipTrigger = this.tooltipTrigger;
    configState.tooltipPlacement = this.tooltipPlacement;
    configState.tooltipFollowCursor = this.tooltipFollowCursor;
    configState.tooltipDelay = this.tooltipDelay;
    configState.showTierBadge = this.showTierBadge;
    configState.showScalingValues = this.showScalingValues;
    configState.corruptedPenaltySeed = this.corruptedPenaltySeed;
  }

  @Watch('language')
  languageChanged(newVal: Language) {
    configState.language = newVal;
  }

  @Watch('tooltipTrigger')
  tooltipTriggerChanged(newVal: TooltipTrigger) {
    configState.tooltipTrigger = newVal;
  }

  @Watch('tooltipPlacement')
  tooltipPlacementChanged(newVal: TooltipPlacement) {
    configState.tooltipPlacement = newVal;
  }

  @Watch('tooltipFollowCursor')
  tooltipFollowCursorChanged(newVal: boolean) {
    configState.tooltipFollowCursor = newVal;
  }

  @Watch('tooltipDelay')
  tooltipDelayChanged(newVal: number) {
    configState.tooltipDelay = newVal;
  }

  @Watch('showTierBadge')
  showTierBadgeChanged(newVal: boolean) {
    configState.showTierBadge = newVal;
  }

  @Watch('showScalingValues')
  showScalingValuesChanged(newVal: boolean) {
    configState.showScalingValues = newVal;
  }

  @Watch('corruptedPenaltySeed')
  corruptedPenaltySeedChanged(newVal?: number) {
    configState.corruptedPenaltySeed = newVal;
  }

  render() {
    return <slot />;
  }
}
