import type { AddStoreOptions, MapStoreManager } from '@hungpvq/map-core';
import { MAP_STORE_KEY } from '@hungpvq/map-core';
import { getOrCreateStore } from '@hungpvq/shared-store';

export type MapScopedStoreOptions = AddStoreOptions;

type MapStoreKey = (typeof MAP_STORE_KEY)[keyof typeof MAP_STORE_KEY];
export type MapScopedKey = MapStoreKey | (string & object);

type StoreManagerSlot = {
  current: MapStoreManager | null;
};

function storeManagerSlot(): StoreManagerSlot {
  return getOrCreateStore('__hungpvq_react_map_storeManager__', () => ({
    current: null as MapStoreManager | null,
  }));
}

export function setStoreManager(manager: MapStoreManager) {
  storeManagerSlot().current = manager;
}

export function createMapScopedStore<T>(
  mapId: string,
  key: MapScopedKey,
  factory: () => T,
  options?: MapScopedStoreOptions,
): T {
  const storeManagerRef = storeManagerSlot().current;
  if (!storeManagerRef) {
    throw new Error('Store manager not initialized');
  }
  const existing = storeManagerRef.peekStore<T>(mapId, key as string);
  if (existing !== undefined) {
    return existing;
  }
  return storeManagerRef.addStore(mapId, key as string, factory, options);
}
