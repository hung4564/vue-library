import {
  createDefaultCrsStore,
  MAP_STORE_KEY,
  type MapCrsStore,
} from '@hungpvq/map-core';
import { createMapScopedStore } from '../../store';

export const useMapCrsStore = (mapId: string) =>
  createMapScopedStore<MapCrsStore>(mapId, MAP_STORE_KEY.CRS, () => {
    return createDefaultCrsStore();
  });
