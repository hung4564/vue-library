import { GlobalStoreService } from '@hungpvq/shared-store';

import { getMapBag } from '../store-access';

/** Shallow snapshot of the process-wide shared store bag. */
export function snapshotGlobalStore(): Record<string, unknown> {
  return { ...GlobalStoreService.getInstance().getState() };
}

/** Shallow snapshot of `map:core[mapId]` (one map’s store bags). */
export function snapshotMapScopedStore(mapId: string): Record<string, unknown> {
  const bag = getMapBag(mapId);
  return bag ? { ...bag } : {};
}
