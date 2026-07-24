import { Component, Prop, State, Watch, Element, Event, EventEmitter, h } from '@stencil/core';
import { Hero, HeroCardBackground, HeroCardPose, HeroClassName } from '../../types';
import { fetchHero } from '../../api/client';
import { configState, onConfigChange } from '../../store/config-store';
import { heroCardBacker, heroCardBorder } from '../../utils/assets';
import { injectFonts } from '../../utils/fonts';

@Component({
  tag: 'dl-hero-card',
  styleUrl: 'dl-hero-card.css',
  shadow: true,
})
export class DlHeroCard {
  @Element() el!: HTMLElement;

  /** Hero numeric ID. Alternative to `class-name` / `hero-name`. */
  @Prop({ attribute: 'hero-id' }) heroId?: number;

  /** Hero class name (e.g. `"hero_inferno"`). Alternative to `hero-id` / `hero-name`. */
  @Prop({ attribute: 'class-name' }) heroClassName?: HeroClassName;

  /** Hero display name in English (e.g. `"Infernus"`). Alternative to `hero-id` / `class-name`. */
  @Prop({ attribute: 'hero-name' }) heroName?: string;

  /** Pre-loaded hero data object. When provided, skips the API fetch. */
  @Prop({ attribute: 'hero-data' }) heroData?: Hero;

  /** Hide the frame border overlay. */
  @Prop({ reflect: true, attribute: 'border-none' }) borderNone = false;

  /** Round the card corners (drops the irregular in-game card mask). Combine with `border-none` for a fully clean card. */
  @Prop({ reflect: true }) rounded = false;

  /** Card fill behind the portrait: `"color"` is the hero-colored gradient; `"image"` uses the hero's themed background art; `"none"` keeps the gradient without the hero color; `"transparent"` removes the fill entirely. */
  @Prop({ reflect: true }) background: HeroCardBackground = 'color';

  /** Overlay the hero's name branding artwork at the bottom of the card. */
  @Prop({ reflect: true, attribute: 'show-branding' }) showBranding = false;

  /** Hero portrait art. `"default"` is the regular card art; `"gloat"` and `"critical"` are the win/loss pose arts. */
  @Prop({ reflect: true }) pose: HeroCardPose = 'default';

  /** Emitted when the card is clicked. Detail is the resolved `Hero`. */
  @Event({ eventName: 'heroClick' }) heroClick!: EventEmitter<Hero>;

  /** Emitted when the pointer enters the card (hover start). Detail is the resolved `Hero`. */
  @Event({ eventName: 'heroEnter' }) heroEnter!: EventEmitter<Hero>;

  /** Emitted when the pointer leaves the card (hover end). Detail is the resolved `Hero`. */
  @Event({ eventName: 'heroLeave' }) heroLeave!: EventEmitter<Hero>;

  @State() private _hero?: Hero;
  @State() private _loading = false;
  @State() private _error?: string;

  private _unsubLanguage?: () => void;

  private get hero(): Hero | undefined {
    return this.heroData ?? this._hero;
  }

  private get heroKey(): HeroClassName | string | number | undefined {
    return this.heroId ?? this.heroClassName ?? this.heroName;
  }

  connectedCallback() {
    injectFonts();
    if (this.heroKey != null && !this.heroData) {
      this.fetchHeroData();
    }
    this._unsubLanguage = onConfigChange('language', () => {
      if (this.heroKey != null && !this.heroData) {
        this.fetchHeroData();
      }
    });
  }

  disconnectedCallback() {
    this._unsubLanguage?.();
  }

  @Watch('heroId')
  @Watch('heroClassName')
  @Watch('heroName')
  heroKeyChanged() {
    if (this.heroKey != null && !this.heroData) {
      this.fetchHeroData();
    }
  }

  private async fetchHeroData() {
    const key = this.heroKey;
    if (key == null) return;
    this._loading = true;
    this._error = undefined;
    try {
      this._hero = await fetchHero(key, configState.language);
    } catch (e) {
      this._hero = undefined;
      this._error = e instanceof Error ? e.message : 'Failed to load hero';
    } finally {
      this._loading = false;
    }
  }

  private getImageSrc(hero: Hero): string | undefined {
    const images = hero.images;
    if (!images) return undefined;
    if (this.pose === 'gloat') {
      return images.hero_card_gloat_webp || images.hero_card_gloat || images.icon_hero_card_webp || images.icon_hero_card || undefined;
    }
    if (this.pose === 'critical') {
      return images.hero_card_critical_webp || images.hero_card_critical || images.icon_hero_card_webp || images.icon_hero_card || undefined;
    }
    return images.icon_hero_card_webp || images.icon_hero_card || undefined;
  }

  private getBackgroundSrc(hero: Hero): string | undefined {
    if (this.background !== 'image') return undefined;
    return hero.images?.background_image_webp || hero.images?.background_image || undefined;
  }

  private getNameImageSrc(hero: Hero): string | undefined {
    if (!this.showBranding) return undefined;
    return hero.images?.name_image || undefined;
  }

  private handleClick = () => {
    const hero = this.hero;
    if (hero) this.heroClick.emit(hero);
  };

  private handleMouseEnter = () => {
    const hero = this.hero;
    if (hero) this.heroEnter.emit(hero);
  };

  private handleMouseLeave = () => {
    const hero = this.hero;
    if (hero) this.heroLeave.emit(hero);
  };

  render() {
    const hero = this.hero;
    const maskStyle = {
      '--dl-card-backer-mask': `url(${heroCardBacker()})`,
      '--dl-card-border-mask': `url(${heroCardBorder()})`,
    };

    if (this._loading || (!hero && !this._error)) {
      // Reserve the card's footprint only; nothing is painted while loading.
      return <div class="hero-box"></div>;
    }

    if (this._error || !hero) {
      const error = this._error ?? 'Failed to load hero';
      return (
        <div class="hero-box" style={maskStyle}>
          <div class="card error" title={error} aria-label={error}>
            <div class="card-fill">
              <span class="hero-error-glyph" aria-hidden="true">!</span>
            </div>
            <div class="card-border"></div>
          </div>
        </div>
      );
    }

    const imgSrc = this.getImageSrc(hero);
    const bgSrc = this.getBackgroundSrc(hero);
    const nameSrc = this.getNameImageSrc(hero);
    const heroColor = hero.colors?.style_hex;
    return (
      <div
        class="hero-box"
        style={{ ...maskStyle, ...(heroColor ? { '--dl-hero-color': heroColor } : {}) }}
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {/* Reserved for the in-game hover flame; slot an element to recreate it */}
        <div class="hover-effect-layer" part="hover-effect" aria-hidden="true">
          <slot name="hover-effect"></slot>
        </div>
        <div class="card" part="card">
          <div class="card-fill">
            {bgSrc && <img class="card-background" src={bgSrc} alt="" loading="lazy" />}
            {imgSrc && <img class="hero-portrait" part="portrait" src={imgSrc} alt={hero.name} loading="lazy" />}
            {nameSrc && <img class="hero-name-image" part="name-image" src={nameSrc} alt={hero.name} loading="lazy" />}
          </div>
          <div class="card-border" part="border"></div>
        </div>
      </div>
    );
  }
}
