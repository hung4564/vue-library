import { logHelper, MapFCOnUseMap, MapSimple } from '@hungpvq/shared-map';
import { defineStore } from '@hungpvq/shared-store';
import { useMapMittStore } from '../extra/mitt';
import {
  hasMapCollection,
  hasMapInstance,
  isMultiMapStore,
  MapStore,
} from '../types';
import { MAP_STORE_KEY } from '../types/key';
import { logger } from './logger';
const MAP_CORE_STORE_ID = 'map:core';
type MapRootStore = Record<string, MapStore>;
export const useMapGLobalStore = defineStore<MapRootStore>(
  MAP_CORE_STORE_ID,
  () => ({}),
);

export const MAP_CORE_EVENT = {
  READY: 'ready',
} as const;

type DefaultValue<T> = T | (() => T);
type StoreCleanup = () => void | Promise<void>;
type AddStoreOptions = {
  cleanup?: StoreCleanup;
};
type MapStoreKey = (typeof MAP_STORE_KEY)[keyof typeof MAP_STORE_KEY];
type MapScopedKey = MapStoreKey | (string & object);
type MapStoreInternal = MapStore & {
  __cleanup__?: Record<string, StoreCleanup[]>;
};

function storeLogger(mapId: string) {
  return logHelper(logger, mapId, 'store');
}

function getRootStore(): MapRootStore {
  return useMapGLobalStore();
}

function ensureMapEntry(mapId: string): MapStore {
  const root = getRootStore();
  if (!root[mapId]) {
    storeLogger(mapId).debug('ensureMapEntry: create new entry');
    root[mapId] = {};
  }
  return root[mapId];
}

function resolveDefaultValue<T>(defaultValue?: DefaultValue<T>): T {
  if (typeof defaultValue === 'function') {
    return (defaultValue as () => T)();
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  return {} as T;
}

function collectMapsFromStore(mapId: string): MapSimple[] {
  const store = getMapStore(mapId);
  if (!store) {
    return [];
  }
  if (hasMapCollection(store)) {
    return store.maps;
  }
  if (hasMapInstance(store)) {
    return [store.map];
  }
  return [];
}

export function getMapStore(id: string) {
  const entry = getRootStore()[id];
  if (!entry) {
    storeLogger(id).debug('getMapStore: entry not found');
  }
  return entry;
}
export function addStore<T = Record<string, unknown>>(
  mapId: string,
  key: string,
  defaultValue?: DefaultValue<T>,
  options?: AddStoreOptions,
) {
  const temp = ensureMapEntry(mapId);
  if (!(key in temp)) {
    storeLogger(mapId).debug('addStore: initialize key', key);
    temp[key] = resolveDefaultValue(defaultValue);
  } else {
    storeLogger(mapId).debug('addStore: reuse key', key);
  }
  if (options?.cleanup) {
    registerCleanup(mapId, key, options.cleanup);
  }
  return temp[key] as T;
}
export function getStore<T>(mapId: string, key: string): T | undefined {
  const temp = getMapStore(mapId);
  if (!temp || !(key in temp)) {
    storeLogger(mapId).debug('getStore: missing key', key);
    return undefined;
  }
  return temp[key] as T;
}

export function getIsMulti(id: string): boolean {
  return isMultiMapStore(getMapStore(id));
}
export function getMaps(id: string): MapSimple[] {
  return collectMapsFromStore(id);
}

export function getMap(
  id: string,
  cb?: MapFCOnUseMap,
): MapSimple | MapSimple[] | undefined {
  const maps = collectMapsFromStore(id);
  if (maps.length) {
    if (cb) {
      maps.forEach((mapInstance) => cb(mapInstance));
    }
    return maps.length > 1 ? maps : maps[0];
  }

  if (cb) {
    storeLogger(id).debug('getMap: waiting for map instance');
    const emitter = useMapMittStore(id);
    const handler = () => {
      const readyMaps = collectMapsFromStore(id);
      if (readyMaps.length) {
        readyMaps.forEach((m) => cb(m));
        emitter.off(MAP_CORE_EVENT.READY, handler);
      }
    };
    emitter.on(MAP_CORE_EVENT.READY, handler);
  } else {
    storeLogger(id).debug('getMap: map instance not ready');
  }

  return undefined;
}

export const useMapStore = (mapId: string) => {
  return {
    getIsMulti(): boolean {
      return !!getMapStore(mapId)?.isMulti;
    },
    getMaps(): MapSimple[] | undefined {
      const maps = collectMapsFromStore(mapId);
      return maps.length ? maps : undefined;
    },
    getMap(cb?: MapFCOnUseMap) {
      return getMap(mapId, cb);
    },
  };
};
export const useMapContainer = (mapId: string) => {
  const store = useMapGLobalStore();
  return {
    initMaps(maps: MapSimple[]) {
      logHelper(logger, mapId, 'store').debug('init maps', maps);
      const mapStore = ensureMapEntry(mapId);
      mapStore.maps = maps;
      mapStore.isMulti = maps.length > 1;
      delete mapStore.map;
      useMapMittStore(mapId).emit(MAP_CORE_EVENT.READY);
    },
    initMap(map: MapSimple) {
      logHelper(logger, mapId, 'store').debug('init', map);
      const mapStore = ensureMapEntry(mapId);
      mapStore.map = map;
      mapStore.isMulti = false;
      delete mapStore.maps;
      useMapMittStore(mapId).emit(MAP_CORE_EVENT.READY);
    },
    removeMap() {
      logHelper(logger, mapId, 'store').debug('removeMap');
      runCleanup(mapId);
      delete store[mapId];
    },
  };
};

function registerCleanup(mapId: string, key: string, cleanup: StoreCleanup) {
  const store = ensureMapEntry(mapId) as MapStoreInternal;
  store.__cleanup__ ??= {};
  store.__cleanup__[key] ??= [];
  store.__cleanup__[key].push(cleanup);
}

function runCleanup(mapId: string, key?: string) {
  const store = getMapStore(mapId) as MapStoreInternal | undefined;
  const mapCleanups = store?.__cleanup__;
  if (!mapCleanups) {
    return;
  }
  const targetKeys = key ? [key] : Object.keys(mapCleanups);
  targetKeys.forEach((cleanupKey) => {
    const cleanups = mapCleanups[cleanupKey] ?? [];
    delete mapCleanups[cleanupKey];
    cleanups.forEach((cleanup) => {
      try {
        const maybePromise = cleanup();
        if (
          maybePromise &&
          typeof (maybePromise as Promise<unknown>).catch === 'function'
        ) {
          (maybePromise as Promise<unknown>).catch((error) => {
            storeLogger(mapId).error('cleanup rejected', {
              key: cleanupKey,
              error,
            });
          });
        }
      } catch (error) {
        storeLogger(mapId).error('cleanup failed', {
          key: cleanupKey,
          error,
        });
      }
    });
  });
  if (!Object.keys(mapCleanups).length && store) {
    delete store.__cleanup__;
  }
}

export type MapScopedStoreOptions = AddStoreOptions;

export function createMapScopedStore<T>(
  mapId: string,
  key: MapScopedKey,
  factory: () => T,
  options?: MapScopedStoreOptions,
) {
  return addStore<T>(mapId, key, factory, options);
}

export function destroyMapScopedStore(mapId: string, key: MapScopedKey) {
  const store = getMapStore(mapId);
  if (store && key in store) {
    delete store[key];
    runCleanup(mapId, key);
  }
}
