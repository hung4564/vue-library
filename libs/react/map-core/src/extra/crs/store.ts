import { MAP_STORE_KEY } from '@hungpvq/map-core';
import { createDefaultCrsStore, type MapCrsStore } from '@hungpvq/map-core/crs';
import { createMapScopedStore } from '../../store/store-utils';

export const useMapCrsStore = (mapId: string) =>
  createMapScopedStore<MapCrsStore>(mapId, MAP_STORE_KEY.CRS, () => {
    return createDefaultCrsStore();
  });
