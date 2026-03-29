export type TooltipTrigger = 'hover' | 'click' | 'none';

export type TooltipPlacement = 'auto' | 'top' | 'bottom' | 'left' | 'right';

export type TooltipSectionType = 'innate' | 'active' | 'passive';

export interface TooltipSectionAttribute {
  loc_string?: string | null;
  properties?: string[] | null;
  elevated_properties?: string[] | null;
  important_properties?: string[] | null;
}

export interface TooltipSection {
  section_type: TooltipSectionType | null;
  section_attributes: TooltipSectionAttribute[];
}
