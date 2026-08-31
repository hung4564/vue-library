import {
  logHelper,
  MAP_STORE_KEY,
  createDefaultEventStore,
  type MapEventStore,
} from '@hungpvq/map-core';
import { createMapScopedStore } from '../../store';
import { logger } from './logger';
export const useMapEventStore = (mapId: string) =>
  createMapScopedStore<MapEventStore>(mapId, MAP_STORE_KEY.EVENT, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return createDefaultEventStore();
  });
