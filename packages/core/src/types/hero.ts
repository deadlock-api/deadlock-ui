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

/** The subset of the `/v1/assets/heroes` entry that the components consume. */
export interface Hero {
  id: number;
  class_name: HeroClassName;
  name: string;
  description?: HeroDescription | null;
  player_selectable?: boolean | null;
  disabled?: boolean | null;
  in_development?: boolean | null;
  images?: HeroImages | null;
  colors?: HeroColors | null;
}
