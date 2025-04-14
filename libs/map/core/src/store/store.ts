import { createStore } from '@hungpvq/shared';
import { MapFCOnUseMap, MapSimple } from '@hungpvq/shared-map';
import { MapStore } from '../types';
import { addMapIdToQueue, removeMapIdFromQueue } from './queue';
const store = createStore('map.core', {
  state: {} as Record<string, MapStore>,
  getters: {},
  actions: {
    getMapStore(id: string) {
      const map = store.state[id];
      if (!map) {
        return;
        // throw 'Not found map for id ' + id;
      }
      return map;
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
      const map = store.state[id]?.map;
      if (!map) {
        return;
        // throw 'Not found map for id ' + id;
      }
      if (cb) {
        return cb(map);
      }
      return map;
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
