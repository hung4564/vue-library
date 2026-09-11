import { logHelper, MAP_STORE_KEY } from '@hungpvq/map-core';
import type { ResolvedControlLayout } from '@hungpvq/map-core';
import {
  createDefaultToolbarStore,
  createToolbarStoreApi,
  createToolbarModuleApi,
  type MapToolbarStore,
} from '@hungpvq/map-core/toolbar';
import { createMapScopedStore } from '../../store/store';
import { logger } from './logger';

export type { MapToolbarStore };

export const useMapToolbarStore = (mapId: string) =>
  createMapScopedStore<MapToolbarStore>(mapId, MAP_STORE_KEY.TOOLBAR, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return createDefaultToolbarStore();
  });

export const useMapToolbar = (mapId: string) => {
  const store = useMapToolbarStore(mapId);
  return createToolbarStoreApi(store);
};

export const useMapToolbarModule = (
  mapId: string,
  controlLayout:
    | ResolvedControlLayout
    | 'button'
    | undefined
    | (() => ResolvedControlLayout | 'button' | undefined),
) => {
  const store = useMapToolbarStore(mapId);
  return createToolbarModuleApi(store, controlLayout);
};
