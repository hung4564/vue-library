import { logHelper, MAP_STORE_KEY } from '@hungpvq/map-core';
import {
  createDefaultEventStore,
  type MapEventStore,
} from '@hungpvq/map-core/event';
import { loggerFactory } from '@hungpvq/shared-log';
import { createMapScopedStore } from '../../store/store-utils';
import { getStore } from '../../store/store';

export type { MapEventStore };

export const logger = loggerFactory.createLogger().setNamespace('map:event', 2);

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
