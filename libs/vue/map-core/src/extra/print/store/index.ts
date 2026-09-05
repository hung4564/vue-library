/**
 * Vue-specific print store
 */

import {
  type MapPrintStore,
  logHelper,
  MAP_STORE_KEY,
  createDefaultPrintStore,
  createPrintStoreApi,
} from '@hungpvq/map-core';
import { createMapScopedStore } from '../../../store/store';
import { loggerFactory } from '@hungpvq/shared-log';

const logger = loggerFactory.createLogger().setNamespace('map:print', 2);

export const KEY = MAP_STORE_KEY.PRINT;

export const useMapPrintStore = (mapId: string) =>
  createMapScopedStore<MapPrintStore>(mapId, KEY, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return createDefaultPrintStore();
  });

export function useMapPrint(mapId: string) {
  const store = useMapPrintStore(mapId);
  return createPrintStoreApi(store);
}
