// Hero class names follow the in-game `hero_*` convention. Kept dynamic so
// newly released heroes work without regenerating a hardcoded union:
// runtime data always comes straight from the API.
export type HeroClassName = `hero_${string}`;
