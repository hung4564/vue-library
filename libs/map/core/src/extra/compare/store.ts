import { logHelper } from '@hungpvq/shared-map';
import { addStore, getStore } from '../../store';
import { MittType } from '../../types';
import { MAP_STORE_KEY } from '../../types/key';
import { logger } from './logger';
import {
  MapCompareSetting,
  MittTypeMapCompareEventKey,
  type MittTypeMapCompare,
} from './types';

export type MapLocateStore = {
  setting: MapCompareSetting;
};

export function initStoreMapCompare(mapId: string) {
  logHelper(logger, mapId, 'store').debug('init');
  addStore<MapLocateStore>(mapId, MAP_STORE_KEY.MAP_COMPARE, {
    setting: {
      compare: true,
      split: true,
      sync: true,
      vertical: false,
    },
  });
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
  const emitter = getStore<MittType<MittTypeMapCompare>>(
    mapId,
    MAP_STORE_KEY.MITT,
  );
  emitter.emit(MittTypeMapCompareEventKey.set, {
    ...store?.setting,
    ...setting,
  });
}
