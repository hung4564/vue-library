/**
 * True when `mapId` can own a `map:core` entry / scoped store.
 * Empty string must never be used (avoids `map:core[""]` pollution).
 */
export function isUsableMapId(
  mapId: string | null | undefined,
): mapId is string {
  return typeof mapId === 'string' && mapId.length > 0;
}
