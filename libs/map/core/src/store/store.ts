import { createStore } from '@hungpvq/shared';
import { MapFCOnUseMap, MapSimple } from '@hungpvq/shared-map';
import { MapStore } from '../types';
import { addMapIdToQueue, removeMapIdFromQueue } from './queue';
type MapRootStore = Record<string, MapStore>;
const store = createStore<MapRootStore>('map.core', {});
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
export function removeMap(store: MapRootStore, id: string) {
  delete store[id];
  removeMapIdFromQueue(id);
}

export function initMap(store: MapRootStore, id: string, map: MapSimple) {
  store[id] = {
    map,
  };
  addMapIdToQueue(id);
}

export function initMaps(store: MapRootStore, id: string, maps: MapSimple[]) {
  store[id] = {
    maps,
    isMulti: maps.length > 1,
  };
  addMapIdToQueue(id);
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
