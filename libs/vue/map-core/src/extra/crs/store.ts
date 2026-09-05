import { logHelper, createDefaultCrsStore, MAP_STORE_KEY } from '@hungpvq/map-core';
import { createMapScopedStore } from '../../store';
import { logger } from './logger';
import type { MapCrsStore } from '@hungpvq/map-core';

export const useMapCrsStore = (mapId: string) =>
  createMapScopedStore<MapCrsStore>(mapId, MAP_STORE_KEY.CRS, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return createDefaultCrsStore();
  });
