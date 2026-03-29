import { createStore } from '@stencil/store';
import { Language, TooltipTrigger, TooltipPlacement } from '../types';

interface ConfigState {
  language: Language;
  tooltipTrigger: TooltipTrigger;
  tooltipPlacement: TooltipPlacement;
  tooltipFollowCursor: boolean;
  tooltipDelay: number;
  showTierBadge: boolean;
}

const { state, onChange } = createStore<ConfigState>({
  language: Language.EN,
  tooltipTrigger: 'hover',
  tooltipPlacement: 'auto',
  tooltipFollowCursor: false,
  tooltipDelay: 150,
  showTierBadge: true,
});

export { state as configState, onChange as onConfigChange };
