import { Component, Prop, Watch, h } from '@stencil/core';
import { Language, TooltipBehavior, TooltipPlacement } from '../../types';
import { configState } from '../../store/config-store';

@Component({
  tag: 'dl-provider',
  shadow: false,
})
export class DlProvider {
  /** Language for item data (e.g. `"english"`, `"brazilian"`, `"japanese"`). */
  @Prop() language: Language = 'english';

  /** How the item tooltip is triggered: `"tooltip"` on hover, `"popover"` on click, or `"none"` to disable. */
  @Prop({ attribute: 'tooltip-behavior' }) tooltipBehavior: TooltipBehavior = 'tooltip';

  /** Preferred tooltip position. `"auto"` picks the side with the most space. */
  @Prop({ attribute: 'tooltip-placement' }) tooltipPlacement: TooltipPlacement = 'auto';

  /** Delay in milliseconds before showing the tooltip on hover. */
  @Prop({ attribute: 'tooltip-delay', reflect: true }) tooltipDelay: number = 150;

  /** Show tier badge on item cards globally. Individual cards can override this. */
  @Prop({ attribute: 'show-tier-badge' }) showTierBadge: boolean = true;

  connectedCallback() {
    configState.language = this.language;
    configState.tooltipBehavior = this.tooltipBehavior;
    configState.tooltipPlacement = this.tooltipPlacement;
    configState.tooltipDelay = this.tooltipDelay;
    configState.showTierBadge = this.showTierBadge;
  }

  @Watch('language')
  languageChanged(newVal: Language) {
    configState.language = newVal;
  }

  @Watch('tooltipBehavior')
  tooltipBehaviorChanged(newVal: TooltipBehavior) {
    configState.tooltipBehavior = newVal;
  }

  @Watch('tooltipPlacement')
  tooltipPlacementChanged(newVal: TooltipPlacement) {
    configState.tooltipPlacement = newVal;
  }

  @Watch('tooltipDelay')
  tooltipDelayChanged(newVal: number) {
    configState.tooltipDelay = newVal;
  }

  @Watch('showTierBadge')
  showTierBadgeChanged(newVal: boolean) {
    configState.showTierBadge = newVal;
  }

  render() {
    return <slot />;
  }
}
