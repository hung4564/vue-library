/**
 * React global store definition
 * Uses @hungpvq/shared-store (same as Vue) for shared state across frameworks
 */

import { GlobalStoreService } from '@hungpvq/shared-store';
import type { MapStore } from '@hungpvq/map-core';

export const MAP_CORE_STORE_ID = 'map:core';

type MapRootStore = Record<string, MapStore>;

/**
 * Global map root store (sync). Prefer this name outside React components/hooks.
 * For reactive reads in components, use `useMapState(mapId)`.
 */
export function getMapGlobalStore(): MapRootStore {
  const store = GlobalStoreService.getInstance();
  if (!store.has(MAP_CORE_STORE_ID)) {
    store.set(MAP_CORE_STORE_ID, {} as MapRootStore);
  }
  return (store.get<MapRootStore>(MAP_CORE_STORE_ID) ?? {}) as MapRootStore;
}

/** Parity alias with Vue `useMapGlobalStore` — use only in components / custom hooks. */
export const useMapGlobalStore = getMapGlobalStore;

/**
 * Provider component for global store (optional; store is shared via @hungpvq/shared-store)
 */
export function MapGlobalStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
