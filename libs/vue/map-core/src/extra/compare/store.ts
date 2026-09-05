import {
  logHelper,
  MAP_STORE_KEY,
  createDefaultCompareStore,
  type MapCompareSetting,
  type MapCompareStore,
  MittTypeMapCompareEventKey,
  type MittTypeMapCompare,
} from '@hungpvq/map-core';
import { createMapScopedStore, getStore } from '../../store';
import { useMapMittStore } from '../mitt';
import { logger } from './logger';

export type MapLocateStore = MapCompareStore;

export function initStoreMapCompare(mapId: string) {
  logHelper(logger, mapId, 'store').debug('init');
  createMapScopedStore<MapLocateStore>(
    mapId,
    MAP_STORE_KEY.MAP_COMPARE,
    () => createDefaultCompareStore(),
  );
}
export function getMapCompare(mapId: string) {
  const store = getStore<MapLocateStore>(mapId, MAP_STORE_KEY.MAP_COMPARE);
  if (!store) {
    initStoreMapCompare(mapId);
    return getStore<MapLocateStore>(mapId, MAP_STORE_KEY.MAP_COMPARE);
  }
  return store;
}
export function getMapCompareSetting(mapId: string) {
  const store = getMapCompare(mapId);
  return store?.setting;
}

export function updateMapCompareSetting(
  mapId: string,
  setting: MapCompareSetting,
) {
  logHelper(logger, mapId, 'store').debug('updateMapCompareSetting', setting);
  const store = getMapCompare(mapId);
  if (store) store.setting = { ...store.setting, ...setting };
  const emitter = useMapMittStore<MittTypeMapCompare>(mapId);
  emitter.emit(MittTypeMapCompareEventKey.set, {
    ...store?.setting,
    ...setting,
  });
}
