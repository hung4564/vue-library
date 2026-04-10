import {
  logHelper,
  MapCompareSetting,
  MittTypeMapCompareEventKey,
  type MittTypeMapCompare,
} from '@hungpvq/map-core';
import { MAP_STORE_KEY } from '@hungpvq/map-core';
import { createMapScopedStore, getStore } from '../../store/store';
import { useMapMittStore } from '../mitt';

export type MapLocateStore = {
  setting: MapCompareSetting;
};

const logger = { debug: (..._args: unknown[]) => {} };

export function initStoreMapCompare(mapId: string) {
  logHelper(logger, mapId, 'store').debug('init');
  createMapScopedStore<MapLocateStore>(
    mapId,
    MAP_STORE_KEY.MAP_COMPARE,
    () => ({
      setting: {
        compare: true,
        split: true,
        sync: true,
        vertical: false,
      },
    })
  );
}

export function getMapCompare(mapId: string) {
  const store = getStore<MapLocateStore>(
    mapId,
    MAP_STORE_KEY.MAP_COMPARE
  );
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
  setting: MapCompareSetting
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
