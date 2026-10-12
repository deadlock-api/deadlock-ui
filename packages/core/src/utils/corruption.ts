import { CorruptedPenalty, CorruptedPenaltyName, CorruptionConfig, Item, ItemProperty, PropertyUpgrade } from '../types';
import { UniformRandomStream } from './random';

export type { CorruptionConfig };

/**
 * Fallback for `fetchCorruptionConfig()`, used when a convar cannot be loaded and
 * as the default `config` argument. Matches the convar defaults of build 6774.
 */
export const CORRUPTION_CONFIG: Readonly<CorruptionConfig> = Object.freeze({
  bonusVarianceBetter: 15,
  bonusVarianceWorse: 15,
  penaltyVariance: 15,
});

type CorruptedBonusVariance = 'scaled' | 'fixed' | 'rounded';

interface CorruptedStat {
  /** Property key in `item.properties`. */
  name: string;
  property: ItemProperty;
  /** Value of the normal item. */
  base: number;
  /** Bonus added by the corruption, before the per-match variance. */
  bonus: number;
  /** `base + bonus`, the value without variance. */
  value: number;
  variance: CorruptedBonusVariance;
}

export interface CorruptedPenaltyEffectRoll {
  /** Position in the penalty's `effects`, which seeds the effect's roll. */
  index: number;
  modifier: string;
  label: string;
  postfix: string;
  /** `false` for effects the game applies but does not list in tooltips. */
  display: boolean;
  /** Penalty for the item's tier: rolled in a match, otherwise without variance. */
  value: number;
}

export interface CorruptedPenaltyRoll {
  name: string;
  /** `roll_weight` of the penalty. */
  weight: number;
  effects: CorruptedPenaltyEffectRoll[];
}

/**
 * What a corrupted item rolled in a match. Keys left out fall back to the value
 * without variance.
 */
export interface CorruptionRoll {
  /** Rolled value per property key, e.g. `{ DPS: 90, Radius: 14.4 }`. */
  stats?: Record<string, number>;
  /** Name of the penalty, e.g. `"MoveSpeed"`. */
  penalty?: string;
  /** Rolled value per penalty effect `modifier_value`. */
  penaltyValues?: Record<string, number>;
}

/** Bit of a purchase's `upgrade_info` (match metadata) set when the item was corrupted. */
const CORRUPTED_UPGRADE_BIT = 0x800000;

/** True when a purchase's `upgrade_info` marks the item as corrupted. */
export function isCorruptedUpgrade(upgradeInfo?: number | null): boolean {
  return !!upgradeInfo && (upgradeInfo & CORRUPTED_UPGRADE_BIT) !== 0;
}

/**
 * Reads the `corrupted` property: `true` or an empty attribute shows the corrupted
 * variant with a random penalty, a penalty name shows it with that penalty.
 */
export function parseCorrupted(value?: boolean | string | null): { corrupted: boolean; penalty?: CorruptedPenaltyName } {
  if (value === undefined || value === null || value === false || value === 'false') return { corrupted: false };
  if (value === true || value === '' || value === 'true') return { corrupted: true };
  return { corrupted: true, penalty: value as CorruptedPenaltyName };
}

/** Removes floating point noise such as `17.349999999999998`. */
function clean(n: number): number {
  return Math.round(n * 1e4) / 1e4;
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const n = Number.parseFloat(String(value));
  return Number.isFinite(n) ? n : null;
}

function bonusVariance(upgrade: PropertyUpgrade): CorruptedBonusVariance {
  if (upgrade.fixed_corrupted_bonus) return 'fixed';
  if (upgrade.round_corrupted_bonus) return 'rounded';
  return 'scaled';
}

/** Stats the corrupted variant of `item` gains. */
function getCorruptedStats(item: Item): CorruptedStat[] {
  const stats: CorruptedStat[] = [];

  for (const upgrade of item.corrupted_info?.property_upgrades ?? []) {
    const property = item.properties?.[upgrade.name];
    const base = toNumber(property?.value);
    const bonus = toNumber(upgrade.bonus);
    if (!property || base === null || bonus === null) continue;

    const variance = bonusVariance(upgrade);
    const value = base + bonus;
    stats.push({
      name: upgrade.name,
      property,
      base,
      bonus,
      value: clean(variance === 'rounded' ? Math.round(value) : value),
      variance,
    });
  }

  return stats;
}

/** Modifiers the item itself gives, e.g. `MODIFIER_VALUE_HEALTH_MAX` for an item with bonus health. */
function providedModifiers(item: Item): Set<string> {
  const provided = new Set<string>();
  for (const property of Object.values(item.properties ?? {})) {
    const value = toNumber(property?.value);
    if (property?.provided_property_type && value) provided.add(property.provided_property_type);
  }
  return provided;
}

/**
 * Penalties the corrupted variant of `item` can roll, in `penalties` order, with
 * the values for the item's tier. A penalty is left out when the item excludes it,
 * when it has no value at the item's tier, or when it changes a stat the item
 * itself gives. `penalties` is `GenericData.corrupted_penalties`.
 */
export function getCorruptedPenaltyPool(item: Item, penalties: CorruptedPenalty[]): CorruptedPenaltyRoll[] {
  if (!item.corrupted_info) return [];

  const excluded = new Set(item.corrupted_info.excluded_penalties);
  const provided = providedModifiers(item);
  const pool = penalties.filter(penalty =>
    !excluded.has(penalty.name)
    && penalty.effects.some(effect => (effect.bonus_per_tier[item.item_tier] ?? 0) !== 0)
    && !penalty.effects.some(effect => provided.has(effect.modifier_value)));

  return pool.map(penalty => ({
    name: penalty.name,
    weight: penalty.roll_weight ?? 1,
    effects: penalty.effects
      .map((effect, index) => ({
        index,
        modifier: effect.modifier_value,
        label: effect.label ?? effect.modifier_value,
        postfix: effect.postfix ?? '',
        display: effect.display,
        value: effect.bonus_per_tier[item.item_tier] ?? 0,
      }))
      .filter(effect => effect.value !== 0),
  }));
}

/**
 * Rounds a value for display like the game tooltips: whole numbers from 20 up
 * (`30%`, `235`), at most two decimals below (`4.82s`, `-11.95%`).
 */
export function roundForDisplay(n: number): number {
  return Math.abs(n) >= 20 ? Math.round(n) : Math.round(n * 100) / 100;
}

/** Formats `n` like the API value it replaces: keeps a trailing unit such as `m`. */
function formatLike(original: string | number | null, n: number): string | number {
  if (typeof original === 'number') return n;
  const unit = String(original ?? '').match(/[^\d.\s-]+$/)?.[0] ?? '';
  return `${n}${unit}`;
}

/**
 * Copy of `item` with the corrupted values in `properties`, so the tooltip can
 * render the corrupted variant. Uses `roll.stats` when given, otherwise the
 * value without variance. Returns `item` unchanged when it cannot be corrupted.
 */
export function toCorruptedItem(item: Item, roll: CorruptionRoll = {}): Item {
  if (!item.corrupted_info || !item.properties) return item;

  const properties = { ...item.properties };
  for (const stat of getCorruptedStats(item)) {
    const value = roundForDisplay(roll.stats?.[stat.name] ?? stat.value);
    properties[stat.name] = { ...stat.property, value: formatLike(stat.property.value, value) };
  }

  return { ...item, properties };
}

/** The penalty `roll` names, with the rolled values applied, or `undefined` when the item cannot roll it. */
export function getRolledPenalty(
  item: Item,
  penalties: CorruptedPenalty[],
  roll: CorruptionRoll,
): CorruptedPenaltyRoll | undefined {
  if (!roll.penalty) return undefined;
  const penalty = getCorruptedPenaltyPool(item, penalties).find(p => p.name === roll.penalty);
  if (!penalty) return undefined;

  return {
    ...penalty,
    effects: penalty.effects.map(effect => ({
      ...effect,
      value: roundForDisplay(roll.penaltyValues?.[effect.modifier] ?? effect.value),
    })),
  };
}

/** Game units per meter, for penalties written in meters. */
const UNITS_PER_METER = 39.3701;

function roundAwayFromZero(n: number): number {
  return Math.sign(n) * Math.round(Math.abs(n));
}

/**
 * What `item` rolled in the match with this `corrupted_penalty_seed`, following the
 * game: every roll has its own stream, seeded from `seed ^ item.id`.
 * - Bonuses: `+ index + 0x1000`, scaled by the bonus variance.
 * - Penalty: picked by weight from the item's pool with the base seed, unless
 *   `penalty` names one.
 * - Penalty values: `+ effect index + 0x2000`, scaled by the penalty variance and
 *   rounded away from zero to whole numbers (in game units for meters).
 */
export function rollCorruption(
  item: Item,
  seed: number,
  penalties: CorruptedPenalty[],
  config: CorruptionConfig = CORRUPTION_CONFIG,
  penalty?: CorruptedPenaltyName,
): CorruptionRoll {
  const base = seed ^ item.id;
  const stream = (offset: number) => new UniformRandomStream((base + offset) | 0);

  const stats = new Map(getCorruptedStats(item).map(stat => [stat.name, stat]));
  const better = 1 + config.bonusVarianceBetter / 100;
  const worse = 1 - config.bonusVarianceWorse / 100;
  const rolledStats: Record<string, number> = {};

  (item.corrupted_info?.property_upgrades ?? []).forEach((upgrade, index) => {
    const stat = stats.get(upgrade.name);
    if (!stat || stat.variance === 'fixed') return;
    const value = stat.base + stat.bonus * stream(index + 0x1000).randomFloat(worse, better);
    rolledStats[stat.name] = stat.variance === 'rounded' ? Math.round(value) : value;
  });

  const pool = getCorruptedPenaltyPool(item, penalties);
  let picked: CorruptedPenaltyRoll | undefined;
  if (penalty) {
    picked = pool.find(p => p.name === penalty);
  } else {
    let pick = stream(0).randomFloat(0, pool.reduce((sum, p) => sum + p.weight, 0));
    picked = pool.find(p => (pick -= p.weight) < 0) ?? pool[pool.length - 1];
  }

  const variance = config.penaltyVariance / 100;
  const penaltyValues: Record<string, number> = {};
  for (const effect of picked?.effects ?? []) {
    const factor = stream(effect.index + 0x2000).randomFloat(1 - variance, 1 + variance);
    penaltyValues[effect.modifier] = effect.postfix.trim() === 'm'
      ? roundAwayFromZero(effect.value * UNITS_PER_METER * factor) / UNITS_PER_METER
      : roundAwayFromZero(effect.value * factor);
  }

  return { stats: rolledStats, penalty: picked?.name, penaltyValues };
}
