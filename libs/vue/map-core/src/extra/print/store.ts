/**
 * Vue-specific print store
 */

import { logHelper, MAP_STORE_KEY } from '@hungpvq/map-core';
import {
  type MapPrintStore,
  createDefaultPrintStore,
  createPrintStoreApi,
  logger,
} from '@hungpvq/map-core/print';
import { createMapScopedStore } from '../../store/store';

export const KEY = MAP_STORE_KEY.PRINT;

export const useMapPrintStore = (mapId: string) =>
  createMapScopedStore<MapPrintStore>(mapId, KEY, () => {
    logHelper(logger, mapId, 'store')
      .with({ fn: 'useMapPrintStore', span: 'store.init' })
      .debug('init');
    return createDefaultPrintStore();
  });

export function useMapPrint(mapId: string) {
  const store = useMapPrintStore(mapId);
  return createPrintStoreApi(store);
}
