/**
 * Process-wide domain store factories → lazy bags on `map:core[mapId][key]`.
 * Separate from `map:core:meta.registries` (resolver defaults).
 */

import { isUsableMapId } from './is-usable-map-id';
import {
  getMapCoreMetaStore,
  getMapCoreRootStore,
  type MapCoreMetaStore,
} from './map-core-meta';
import { registerMapStoreCleanup } from './map-platform-registry';
import type { MapStore, StoreCleanup } from './types';

export type MapDomainStoreFactory<T = unknown> = {
  create: (mapId: string) => T;
  cleanup?: (mapId: string, store: T) => void | Promise<void>;
};

type DomainStoreFactories = Map<string, MapDomainStoreFactory>;

type MapCoreMetaWithDomainFactories = MapCoreMetaStore & {
  domainStoreFactories?: DomainStoreFactories;
};

function getDomainStoreFactories(): DomainStoreFactories {
  const meta = getMapCoreMetaStore() as MapCoreMetaWithDomainFactories;
  if (!meta.domainStoreFactories) {
    meta.domainStoreFactories = new Map();
  }
  return meta.domainStoreFactories;
}

/** Register (or replace) a process-wide factory for a map-scoped domain key. */
export function registerMapDomainStoreFactory<T>(
  key: string,
  factory: MapDomainStoreFactory<T>,
): void {
  getDomainStoreFactories().set(key, factory as MapDomainStoreFactory);
}

export function hasMapDomainStoreFactory(key: string): boolean {
  return getDomainStoreFactories().has(key);
}

/** Test helper — clears all registered domain factories. */
export function clearMapDomainStoreFactories(): void {
  getDomainStoreFactories().clear();
}

function ensureMapEntry(mapId: string): MapStore {
  const root = getMapCoreRootStore();
  let entry = root[mapId];
  if (!entry) {
    entry = {};
    root[mapId] = entry;
  }
  return entry;
}

/**
 * Get or create the domain bag for `mapId`/`key` using a registered factory.
 * Throws if `mapId` is unusable or no factory is registered for `key`.
 */
export function ensureMapDomainStore<T>(mapId: string, key: string): T {
  if (!isUsableMapId(mapId)) {
    throw new Error('mapId is required');
  }
  const factory = getDomainStoreFactories().get(key) as
    MapDomainStoreFactory<T> | undefined;
  if (!factory) {
    throw new Error(
      `No domain store factory registered for key "${key}". Import the domain module or call registerMapDomainStoreFactory.`,
    );
  }

  const entry = ensureMapEntry(mapId);
  if (key in entry) {
    return entry[key] as T;
  }

  const store = factory.create(mapId);
  entry[key] = store;

  if (factory.cleanup) {
    const cleanup: StoreCleanup = () => {
      const current = getMapCoreRootStore()[mapId]?.[key] as T | undefined;
      if (current === undefined) return;
      return factory.cleanup?.(mapId, current);
    };
    registerMapStoreCleanup(mapId, key, cleanup);
  }

  return store;
}
