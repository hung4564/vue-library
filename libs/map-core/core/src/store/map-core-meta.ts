import { getOrCreateStore } from '@hungpvq/shared-store';
import type { MapErrorHandler } from '../services/error-handler.service';
import { MAP_STORE_KEY } from '../types/constants';
import { isUsableMapId } from './is-usable-map-id';
import type { MapRootStore } from './types';

/** Process-wide bag shared across Vue/React and duplicate package copies. */
export const MAP_CORE_META_STORE_KEY = 'map:core:meta';

/**
 * Shared root bag for per-map entries (`map:core[mapId].basemap`, `.lang`, …).
 * Vue/React MapStoreManager and hooks read this via {@link getMapCoreRootStore}.
 */
export const MAP_CORE_ROOT_STORE_KEY = 'map:core';

export type MapCoreErrorCaptureSlot = {
  installed: boolean;
  uninstall: (() => void) | undefined;
};

/** Process-default slot inside `map:core:meta.registries`. */
export type MapCoreMetaRegistryBag = {
  defaultValue: unknown;
};

/**
 * Per-map resolver overrides under `map:core[mapId].resolver`
 * (`MAP_STORE_KEY.RESOLVER`), keyed by registry id.
 */
export type MapResolverStore = Record<string, unknown>;

export type MapCoreMetaStore = {
  /** Tombstones after `removeMap` so getMap/subscribeMapReady do not wait. */
  removedMapIds: Set<string>;
  /** Idempotent window error / unhandledrejection install state. */
  errorCapture: MapCoreErrorCaptureSlot;
  /** Centralized map error handler singleton (filled by error-handler.service). */
  errorHandler?: MapErrorHandler;
  /**
   * Named process-wide **defaults** (identify UI resolver, highlight FX, …).
   * Per-map overrides live on `map:core[mapId].resolver` via
   * {@link createMapCoreMetaRegistry}.
   */
  registries: Map<string, MapCoreMetaRegistryBag>;
};

export function getMapCoreMetaStore(): MapCoreMetaStore {
  const meta = getOrCreateStore<MapCoreMetaStore>(
    MAP_CORE_META_STORE_KEY,
    () => ({
      removedMapIds: new Set<string>(),
      errorCapture: {
        installed: false,
        uninstall: undefined,
      },
      registries: new Map(),
    }),
  );
  // Hot reload / older bags may lack newer fields.
  if (!meta.removedMapIds) {
    meta.removedMapIds = new Set();
  }
  if (!meta.errorCapture) {
    meta.errorCapture = {
      installed: false,
      uninstall: undefined,
    };
  }
  if (!meta.registries) {
    meta.registries = new Map();
  }
  return meta;
}

/** Shared `map:core` root (Vue/React MapStoreManager + adapter global store). */
export function getMapCoreRootStore(): MapRootStore {
  return getOrCreateStore<MapRootStore>(MAP_CORE_ROOT_STORE_KEY, () => ({}));
}

function ensureMapResolverStore(mapId: string): MapResolverStore {
  const root = getMapCoreRootStore();
  let entry = root[mapId];
  if (!entry) {
    entry = {};
    root[mapId] = entry;
  }
  let resolver = entry[MAP_STORE_KEY.RESOLVER] as MapResolverStore | undefined;
  if (!resolver || typeof resolver !== 'object') {
    resolver = {};
    entry[MAP_STORE_KEY.RESOLVER] = resolver;
  }
  return resolver;
}

function peekMapResolverStore(mapId: string): MapResolverStore | undefined {
  if (!isUsableMapId(mapId)) return undefined;
  const entry = getMapCoreRootStore()[mapId];
  const resolver = entry?.[MAP_STORE_KEY.RESOLVER];
  if (!resolver || typeof resolver !== 'object') return undefined;
  return resolver as MapResolverStore;
}

export type MapCoreMetaRegistry<T> = {
  getDefault(): T;
  setDefault(value: T): void;
  /**
   * Per-map override from `map:core[mapId].resolver[key]`, or the process
   * default when unset.
   */
  get(mapId: string): T;
  /** `null` clears the per-map override on `map:core[mapId].resolver`. */
  set(mapId: string, value: T | null): void;
};

export type CreateMapCoreMetaRegistryOptions<T> = {
  /**
   * Registry id: process default under `map:core:meta.registries[key]`,
   * per-map under `map:core[mapId].resolver[key]`.
   */
  key: string;
  /** Used once when the meta bag has no default yet. */
  createDefault: () => T;
};

function ensureRegistryBag(
  key: string,
  createDefault: () => unknown,
): MapCoreMetaRegistryBag {
  const meta = getMapCoreMetaStore();
  let bag = meta.registries.get(key);
  if (!bag) {
    bag = { defaultValue: createDefault() };
    meta.registries.set(key, bag);
    return bag;
  }
  if (bag.defaultValue === undefined) {
    bag.defaultValue = createDefault();
  }
  return bag;
}

/**
 * Process-wide default on `map:core:meta` + per-map override on
 * `map:core[mapId].resolver` (same scoped-store pattern as basemap / lang).
 * `removeMap` deletes the whole map entry, so overrides need no extra cleanup.
 */
export function createMapCoreMetaRegistry<T>(
  options: CreateMapCoreMetaRegistryOptions<T>,
): MapCoreMetaRegistry<T> {
  const bag = () => ensureRegistryBag(options.key, options.createDefault);

  return {
    getDefault() {
      return bag().defaultValue as T;
    },
    setDefault(value) {
      bag().defaultValue = value;
    },
    get(mapId) {
      const override = peekMapResolverStore(mapId)?.[options.key];
      if (override !== undefined) {
        return override as T;
      }
      return bag().defaultValue as T;
    },
    set(mapId, value) {
      if (!isUsableMapId(mapId)) return;
      if (value == null) {
        const resolver = peekMapResolverStore(mapId);
        if (!resolver) return;
        delete resolver[options.key];
        if (Object.keys(resolver).length === 0) {
          const entry = getMapCoreRootStore()[mapId];
          if (entry) delete entry[MAP_STORE_KEY.RESOLVER];
        }
        return;
      }
      ensureMapResolverStore(mapId)[options.key] = value;
    },
  };
}
