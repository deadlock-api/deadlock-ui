import { createStore } from '@stencil/store';
import { Language, TooltipTrigger, TooltipPlacement } from '../types';

interface ConfigState {
  language: Language;
  tooltipTrigger: TooltipTrigger;
  tooltipPlacement: TooltipPlacement;
  tooltipFollowCursor: boolean;
  tooltipDelay: number;
  showTierBadge: boolean;
  showScalingValues: boolean;
  corruptedPenaltySeed?: number;
}

const { state, onChange } = createStore<ConfigState>({
  language: Language.EN,
  tooltipTrigger: 'hover',
  tooltipPlacement: 'auto',
  tooltipFollowCursor: false,
  tooltipDelay: 100,
  showTierBadge: true,
  showScalingValues: false,
  corruptedPenaltySeed: undefined,
});

export { state as configState, onChange as onConfigChange };
