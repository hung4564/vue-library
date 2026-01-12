import { logHelper, MAP_STORE_KEY, type AnyIEvent } from '@hungpvq/map-core';
import { createMapScopedStore } from '../../store';
import { logger } from './logger';

export type MapEventStore = {
  items: AnyIEvent[];
  current: { [key: string]: AnyIEvent | undefined };
};
export const useMapEventStore = (mapId: string) =>
  createMapScopedStore<MapEventStore>(mapId, MAP_STORE_KEY.EVENT, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return {
      items: [],
      current: {},
    };
  });
