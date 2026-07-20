import { Component, Prop, State, Watch, Element, Event, EventEmitter, h } from '@stencil/core';
import { Hero, HeroClassName } from '../../types';
import { fetchHero } from '../../api/client';
import { configState, onConfigChange } from '../../store/config-store';

@Component({
  tag: 'dl-hero-minimap-icon',
  styleUrl: 'dl-hero-minimap-icon.css',
  shadow: true,
})
export class DlHeroMinimapIcon {
  @Element() el!: HTMLElement;

  /** Hero numeric ID. Alternative to `class-name` / `hero-name`. */
  @Prop({ attribute: 'hero-id' }) heroId?: number;

  /** Hero class name (e.g. `"hero_inferno"`). Alternative to `hero-id` / `hero-name`. */
  @Prop({ attribute: 'class-name' }) heroClassName?: HeroClassName;

  /** Hero display name in English (e.g. `"Infernus"`). Alternative to `hero-id` / `class-name`. */
  @Prop({ attribute: 'hero-name' }) heroName?: string;

  /** Pre-loaded hero data object. When provided, skips the API fetch. */
  @Prop({ attribute: 'hero-data' }) heroData?: Hero;

  /** Render a circular backing in the hero's color behind the icon. */
  @Prop({ reflect: true, attribute: 'show-background' }) showBackground = false;

  /** Emitted when the icon is clicked. Detail is the resolved `Hero`. */
  @Event({ eventName: 'heroClick' }) heroClick!: EventEmitter<Hero>;

  /** Emitted when the pointer enters the icon (hover start). Detail is the resolved `Hero`. */
  @Event({ eventName: 'heroEnter' }) heroEnter!: EventEmitter<Hero>;

  /** Emitted when the pointer leaves the icon (hover end). Detail is the resolved `Hero`. */
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
    return hero.images?.minimap_image_webp || hero.images?.minimap_image || undefined;
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

    if (this._loading || (!hero && !this._error)) {
      return <div class={{ 'minimap-icon': true, 'loading': true }}></div>;
    }

    if (this._error || !hero) {
      const error = this._error ?? 'Failed to load hero';
      return (
        <div class={{ 'minimap-icon': true, 'error': true }} title={error} aria-label={error}>
          <span class="error-glyph" aria-hidden="true">!</span>
        </div>
      );
    }

    const imgSrc = this.getImageSrc(hero);
    const heroColor = hero.colors?.style_hex;
    return (
      <div
        class="minimap-icon"
        style={heroColor ? { '--dl-hero-color': heroColor } : undefined}
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {imgSrc && <img class="minimap-icon-img" src={imgSrc} alt={hero.name} loading="lazy" />}
      </div>
    );
  }
}
