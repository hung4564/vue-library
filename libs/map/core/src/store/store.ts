import { createStore } from '@hungpvq/shared';
import { MapFCOnUseMap, MapSimple } from '@hungpvq/shared-map';
import { MapStore } from '../types';
import { addMapIdToQueue, removeMapIdFromQueue } from './queue';
const store = createStore('map.core', {
  state: {} as Record<string, MapStore>,
  getters: {
    getIsMulti(id: string): boolean {
      return !!store.state[id].isMulti;
    },
    getMaps(id: string): MapSimple[] {
      return store.state[id].maps;
    },
  },
  actions: {
    getMapStore(id: string) {
      const map = store.state[id];
      if (!map) {
        return;
        // throw 'Not found map for id ' + id;
      }
      return map;
    },
    initMaps(id: string, maps: MapSimple[]) {
      store.state[id] = {
        maps,
        isMulti: true,
      };
      addMapIdToQueue(id);
    },
    initMap(id: string, map: MapSimple) {
      store.state[id] = {
        map,
      };
      addMapIdToQueue(id);
    },
    removeMap(id: string) {
      delete store.state[id];
      removeMapIdFromQueue(id);
    },
    getMap(id: string, cb?: MapFCOnUseMap) {
      const map = store.state[id]?.map as MapSimple;
      const maps = store.state[id]?.maps as MapSimple[];
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
  },
});
export const { state, getters, actions } = store;
export function addStore<T = any>(
  mapId: string,
  key: string,
  defaultValue?: T
) {
  const store = actions.getMapStore(mapId);
  if (!store) {
    return;
  }
  if (!store[key]) store[key] = defaultValue || {};
  return store[key];
}
export function getStore<T = any>(mapId: string, key: string) {
  const store = actions.getMapStore(mapId);
  return (store?.[key] || {}) as T;
}
export const getMap = store.actions.getMap;

export { store };
