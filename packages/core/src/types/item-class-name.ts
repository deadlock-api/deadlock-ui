// Shop item class names follow the in-game `upgrade_*` convention. Kept
// dynamic so newly released items work without regenerating a hardcoded
// union: runtime data always comes straight from the API.
export type ItemClassName = `upgrade_${string}`;
