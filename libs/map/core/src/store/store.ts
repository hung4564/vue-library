import { createStore } from '@hungpvq/shared';
import { logHelper, MapFCOnUseMap, MapSimple } from '@hungpvq/shared-map';
import { defineStore } from '@hungpvq/shared-store';
import { MapStore } from '../types';
import { logger } from './logger';
type MapRootStore = Record<string, MapStore>;
const store = createStore<MapRootStore>('map:core', {});
export function getMapStore(id: string) {
  const map = store[id];
  if (!map) {
    return;
    // throw 'Not found map for id ' + id;
  }
  return map;
}
export function addStore<T = any>(
  mapId: string,
  key: string,
  defaultValue?: T,
) {
  const temp = getMapStore(mapId);
  if (!temp) {
    return;
  }
  if (!temp[key]) temp[key] = defaultValue || {};
  return temp[key];
}
export function getStore<T = any>(mapId: string, key: string) {
  const temp = getMapStore(mapId);
  return (temp?.[key] || {}) as T;
}

export { store };

export function getIsMulti(id: string): boolean {
  return !!getMapStore(id)?.isMulti;
}
export function getMaps(id: string): MapSimple[] {
  return getMapStore(id)?.maps;
}

export function getMap(id: string, cb?: MapFCOnUseMap) {
  const map = getMapStore(id)?.map as MapSimple;
  const maps = getMapStore(id)?.maps as MapSimple[];
  if (maps) {
    maps.forEach((map) => {
      cb && cb(map);
    });
  }
  if (!map) {
    return;
    // throw 'Not found map for id ' + id;
  }
  if (cb) {
    cb(map);
  }
}

export const useMapGLobalStore = defineStore('map:core', () => {
  const store: Record<string, MapStore> = {};
  return store;
});
export const useMapStore = (mapId: string) => {
  const store = useMapGLobalStore();
  function getMapStore() {
    const map = store[mapId];
    if (!map) {
      return;
      // throw 'Not found map for id ' + id;
    }
    return map;
  }
  return {
    getIsMulti(): boolean {
      return !!getMapStore()?.isMulti;
    },
    getMaps(): MapSimple[] {
      return getMapStore()?.maps;
    },
    getMap(cb?: MapFCOnUseMap) {
      const map = getMapStore()?.map as MapSimple;
      const maps = getMapStore()?.maps as MapSimple[];
      if (maps) {
        maps.forEach((map) => {
          cb && cb(map);
        });
      }
      if (!map) {
        return;
        // throw 'Not found map for id ' + id;
      }
      if (cb) {
        cb(map);
      }
    },
  };
};
export const useMapContainer = (mapId: string) => {
  const store = useMapGLobalStore();
  return {
    initMaps(maps: MapSimple[]) {
      logHelper(logger, mapId, 'store').debug('init maps', maps);
      store[mapId] = {
        maps,
        isMulti: maps.length > 1,
      };
    },
    initMap(map: MapSimple) {
      logHelper(logger, mapId, 'store').debug('init', map);
      store[mapId] = {
        map,
      };
    },
    removeMap() {
      logHelper(logger, mapId, 'store').debug('removeMap');
      delete store[mapId];
    },
  };
};
