/**
 * Map-scoped store key for draw session bag on `map:core[mapId]`.
 * Changing the string value is a SemVer **major**.
 */
export const MAP_DRAW_STORE_KEY = 'draw' as const;

export type MapDrawStoreKey = typeof MAP_DRAW_STORE_KEY;
