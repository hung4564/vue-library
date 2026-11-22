import { getMapBag } from '../store-access';

/** Shallow snapshot of `map:core[mapId]` (one map’s store bags). */
export function snapshotMapScopedStore(mapId: string): Record<string, unknown> {
  const bag = getMapBag(mapId);
  return bag ? { ...bag } : {};
}
