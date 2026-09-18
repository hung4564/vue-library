import { logHelper, MAP_STORE_KEY } from '@hungpvq/map-core';
import {
  createDefaultEventStore,
  type MapEventStore,
} from '@hungpvq/map-core/event';
import { createMapScopedStore, getStore } from '../../store/store';
import { logger } from './logger';

export function useMapEventStore(mapId: string): MapEventStore {
  return createMapScopedStore<MapEventStore>(
    mapId,
    MAP_STORE_KEY.EVENT,
    () => {
      logHelper(logger, mapId, 'store').debug('init');
      return createDefaultEventStore();
    },
    {
      cleanup: (): void => {
        const store = getStore<MapEventStore>(mapId, MAP_STORE_KEY.EVENT);
        if (!store) return;
        store.items.length = 0;
        store.current = {};
        logHelper(logger, mapId, 'store').debug('clear on removeMap');
      },
    },
  );
}
