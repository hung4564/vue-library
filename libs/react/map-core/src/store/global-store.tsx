/**
 * React global store definition
 * Uses @hungpvq/shared-store (same as Vue) for shared state across frameworks
 */

import {
  GlobalStoreService,
  useStoreValue,
} from '@hungpvq/shared-store';
import type { MapStore } from '@hungpvq/map-core';

const MAP_CORE_STORE_ID = 'map:core';

type MapRootStore = Record<string, MapStore>;

function ensureMapCoreStore(): MapRootStore {
  const store = GlobalStoreService.getInstance();
  if (!store.has(MAP_CORE_STORE_ID)) {
    store.set(MAP_CORE_STORE_ID, {} as MapRootStore);
  }
  return (store.get<MapRootStore>(MAP_CORE_STORE_ID) ?? {}) as MapRootStore;
}

/**
 * Get the global store instance (sync, for use outside React components e.g. adapter)
 */
export function getMapGlobalStore(): MapRootStore {
  return ensureMapCoreStore();
}

/**
 * React hook: use global store with re-renders on change (uses shared-store)
 */
export function useMapGlobalStore(): MapRootStore {
  const [store] = useStoreValue<MapRootStore>(MAP_CORE_STORE_ID, {});
  return store ?? {};
}

/**
 * Provider component for global store (for React Context if needed in future)
 * Store is shared via @hungpvq/shared-store, provider is optional
 */
export function MapGlobalStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
