import { ItemSlotType } from './item';

export interface ImagePair {
  png: string;
  webp: string;
}

/** One stat change applied by a corrupted penalty. */
export interface CorruptedPenaltyEffect {
  modifier_value: string;
  /** Penalty value indexed by item tier (index 3 = T3, index 4 = T4), in display units. */
  bonus_per_tier: number[];
  display: boolean;
  display_type?: string | null;
  loc_token_override?: string | null;
  label?: string | null;
  postfix?: string | null;
  css_class?: string | null;
}

/** Names of the downsides the Broker can roll, as in `GenericData.corrupted_penalties`. */
export type CorruptedPenaltyName =
  | 'TechCooldown'
  | 'TechRange'
  | 'Stamina'
  | 'MoveSpeed'
  | 'FireRate'
  | 'TechDuration'
  | 'TechPower'
  | 'WeaponDamage'
  | 'Health'
  | 'BulletResist'
  | 'TechResist';

/** A downside that the Broker can roll onto a corrupted item. */
export interface CorruptedPenalty {
  name: string;
  roll_weight?: number | null;
  effects: CorruptedPenaltyEffect[];
}

export interface CorruptedItemImages {
  frame: ImagePair;
  /** Frame for an active (usable) corrupted item. */
  frame_active: ImagePair;
  tooltip_backers: Record<ItemSlotType, ImagePair>;
}

/**
 * Per-match variance of corrupted items, read from the game's convars (`/v1/assets/convars`).
 * Variances are percentages applied to the bonus or penalty, not to the final value.
 */
export interface CorruptionConfig {
  /** `citadel_corrupted_item_bonus_variance_better` */
  bonusVarianceBetter: number;
  /** `citadel_corrupted_item_bonus_variance_worse` */
  bonusVarianceWorse: number;
  /** `citadel_corrupted_penalty_variance` */
  penaltyVariance: number;
}
