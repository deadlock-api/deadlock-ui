import { createStore } from '@stencil/store';
import { Language, TooltipBehavior, TooltipPlacement } from '../types';

interface ConfigState {
  language: Language;
  tooltipBehavior: TooltipBehavior;
  tooltipPlacement: TooltipPlacement;
  tooltipDelay: number;
  showTierBadge: boolean;
}

const { state, onChange } = createStore<ConfigState>({
  language: Language.EN,
  tooltipBehavior: 'tooltip',
  tooltipPlacement: 'auto',
  tooltipDelay: 150,
  showTierBadge: true,
});

export { state as configState, onChange as onConfigChange };
