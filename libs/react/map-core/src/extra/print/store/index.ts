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

export const useMapPrintStore = (mapId: string) =>
  createMapScopedStore<MapPrintStore>(mapId, MAP_STORE_KEY.PRINT, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return createDefaultPrintStore();
  });

export function useMapPrint(mapId: string) {
  const store = useMapPrintStore(mapId);
  return createPrintStoreApi(store);
}
