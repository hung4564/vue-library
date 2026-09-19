import { logHelper, MAP_STORE_KEY } from '@hungpvq/map-core';
import {
  createDefaultEventStore,
  type MapEventStore,
  logger,
} from '@hungpvq/map-core/event';
import { createMapScopedStore } from '../../store/store';
import { getStore } from '../../store/store';

export type { MapEventStore };

export function useMapEventStore(mapId: string): MapEventStore {
  return createMapScopedStore<MapEventStore>(
    mapId,
    MAP_STORE_KEY.EVENT,
    () => {
      logHelper(logger, mapId, 'store')
        .with({ fn: 'useMapEventStore', span: 'store.init' })
        .debug('init');
      return createDefaultEventStore();
    },
    {
      cleanup: (): void => {
        const store = getStore<MapEventStore>(mapId, MAP_STORE_KEY.EVENT);
        if (!store) return;
        store.items.length = 0;
        store.current = {};
        logHelper(logger, mapId, 'store')
          .with({ fn: 'cleanup', span: 'store.clear' })
          .debug('clear on removeMap');
      },
    },
  );
}
