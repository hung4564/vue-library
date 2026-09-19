import { logHelper, MAP_STORE_KEY } from '@hungpvq/map-core';
import {
  type MapPrintStore,
  createDefaultPrintStore,
  createPrintStoreApi,
  logger,
} from '@hungpvq/map-core/print';
import { createMapScopedStore } from '../../store/store';

export const useMapPrintStore = (mapId: string) =>
  createMapScopedStore<MapPrintStore>(mapId, MAP_STORE_KEY.PRINT, () => {
    logHelper(logger, mapId, 'store')
      .with({ fn: 'useMapPrintStore', span: 'store.init' })
      .debug('Created scoped map store for mapId.');
    return createDefaultPrintStore();
  });

export function useMapPrint(mapId: string) {
  const store = useMapPrintStore(mapId);
  return createPrintStoreApi(store);
}
