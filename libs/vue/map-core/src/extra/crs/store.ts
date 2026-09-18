import { logHelper, MAP_STORE_KEY } from '@hungpvq/map-core';
import { createDefaultCrsStore } from '@hungpvq/map-core/crs';
import { createMapScopedStore } from '../../store/store';
import { logger } from './logger';
import type { MapCrsStore } from '@hungpvq/map-core/crs';

export const useMapCrsStore = (mapId: string) =>
  createMapScopedStore<MapCrsStore>(mapId, MAP_STORE_KEY.CRS, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return createDefaultCrsStore();
  });
