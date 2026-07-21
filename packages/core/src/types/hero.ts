import { HeroClassName } from './hero-class-name';

export type HeroCardPose = 'default' | 'gloat' | 'critical';

export type HeroCardBackground = 'color' | 'image' | 'none' | 'transparent';

export interface HeroDescription {
  lore?: string | null;
  role?: string | null;
  playstyle?: string | null;
}

export interface HeroImages {
  icon_hero_card?: string | null;
  icon_hero_card_webp?: string | null;
  icon_image_small?: string | null;
  icon_image_small_webp?: string | null;
  minimap_image?: string | null;
  minimap_image_webp?: string | null;
  hero_card_critical?: string | null;
  hero_card_critical_webp?: string | null;
  hero_card_gloat?: string | null;
  hero_card_gloat_webp?: string | null;
  top_bar_vertical_image?: string | null;
  top_bar_vertical_image_webp?: string | null;
  background_image?: string | null;
  background_image_webp?: string | null;
  name_image?: string | null;
}

export interface HeroColors {
  ui?: number[] | null;
  style?: number[] | null;
  style_hex?: string | null;
}

export interface HeroStartingStat {
  value: number;
  display_stat_name?: string | null;
}

export interface HeroLevelInfo {
  use_standard_upgrade?: boolean | null;
  bonus_currencies?: string[] | null;
  required_gold?: number | null;
}

export interface Hero {
  id: number;
  class_name: HeroClassName;
  name: string;
  description?: HeroDescription | null;
  player_selectable?: boolean | null;
  disabled?: boolean | null;
  in_development?: boolean | null;
  needs_testing?: boolean | null;
  assigned_players_only?: boolean | null;
  tags?: string[] | null;
  gun_tag?: string | null;
  hero_type?: string | null;
  hideout_rich_presence?: string | null;
  prerelease_only?: boolean | null;
  limited_testing?: boolean | null;
  complexity?: number | null;
  skin?: number | null;
  images?: HeroImages | null;
  items?: Record<string, string> | null;
  starting_stats?: Record<string, HeroStartingStat> | null;
  colors?: HeroColors | null;
  level_info?: Record<string, HeroLevelInfo> | null;
  item_slot_info?: Record<string, { max_purchases_for_tier?: number[] | null }> | null;
  physics?: Record<string, number> | null;
  shop_stat_display?: Record<string, unknown> | null;
  stats_display?: Record<string, unknown> | null;
  hero_stats_ui?: Record<string, unknown> | null;
  cost_bonuses?: Record<string, unknown> | null;
  purchase_bonuses?: Record<string, unknown> | null;
  scaling_stats?: Record<string, unknown> | null;
  standard_level_up_upgrades?: Record<string, number> | null;
  item_draft_bucketing?: Record<string, { bucket?: string | null; weight?: number | null }> | null;
}
