import { ItemClassName } from './item-class-name';
import { TooltipSection } from './tooltip';

export type ItemSlotType = 'weapon' | 'spirit' | 'vitality';

export type ItemTier = 1 | 2 | 3 | 4 | 5;

export type ItemType = 'weapon' | 'ability' | 'upgrade' | 'tech' | 'armor';

export type ItemCardVariant = 'card' | 'icon' | 'image' | 'image-name' | 'inline' | 'inline-text' | 'inline-image';

export type ActivationType =
  | 'hold_toggle'
  | 'instant_cast'
  | 'on_button_is_down'
  | 'passive'
  | 'press'
  | 'press_toggle'
  | 'instant_cast_toggle';

export interface ItemPropertyScaleFunction {
  class_name?: string | null;
  subclass_name?: string | null;
  specific_stat_scale_type?: string | null;
  scaling_stats?: string[] | null;
  stat_scale?: number | string | null;
  street_brawl_stat_scale?: number | string | null;
}

export interface ItemProperty {
  value: string | number | null;
  can_set_token_override?: boolean | null;
  provided_property_type?: string | null;
  css_class?: string | null;
  negative_attribute?: boolean | null;
  disable_value?: string | null;
  display_units?: string | null;
  prefix?: string | null;
  label?: string | null;
  postfix?: string | null;
  postvalue_label?: string | null;
  conditional?: string | null;
  icon?: string | null;
  usage_flags?: string[] | null;
  scale_function?: ItemPropertyScaleFunction | null;
  tooltip_is_elevated?: boolean | null;
  tooltip_is_important?: boolean | null;
}

export interface PropertyUpgrade {
  name: string;
  bonus: string | number;
  scale_stat_filter?: string | null;
  upgrade_type?: string | null;
  /** Corrupted items only: the bonus ignores the per-match variance. */
  fixed_corrupted_bonus?: boolean | null;
  /** Corrupted items only: the rolled value is rounded to an integer. */
  round_corrupted_bonus?: boolean | null;
}

export interface ItemUpgrade {
  property_upgrades: PropertyUpgrade[];
}

/** Broker corruption data of a tier 3 or tier 4 upgrade. */
export interface CorruptedItemInfo {
  /** Property bonuses the corrupted variant gains. */
  property_upgrades: PropertyUpgrade[];
  /** Names of corrupted penalties (see `GenericData.corrupted_penalties`) that never roll on this item. */
  excluded_penalties: string[];
}

export interface Item {
  id: number;
  class_name: ItemClassName;
  name: string;
  type: ItemType;
  item_slot_type: ItemSlotType;
  item_tier: ItemTier;
  cost?: number;
  start_trained?: boolean | null;
  shopable?: boolean | null;
  disabled?: boolean | null;
  activation: ActivationType;
  is_active_item?: boolean;
  imbue?: string | null;
  image?: string | null;
  image_webp?: string | null;
  shop_image?: string | null;
  shop_image_small?: string | null;
  shop_image_webp?: string | null;
  description?: Record<string, string>;
  properties?: Record<string, ItemProperty> | null;
  tooltip_sections?: TooltipSection[] | null;
  upgrades?: ItemUpgrade[] | null;
  corrupted_info?: CorruptedItemInfo | null;
  component_items?: string[] | null;
  weapon_info?: Record<string, unknown> | null;
}
