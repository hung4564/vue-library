import { logHelper, MAP_STORE_KEY } from '@hungpvq/map-core';
import type { ResolvedControlLayout } from '@hungpvq/map-core';
import {
  createDefaultToolbarStore,
  createToolbarStoreApi,
  createToolbarModuleApi,
  type MapToolbarStore,
  logger,
} from '@hungpvq/map-core/toolbar';
import { createMapScopedStore } from '../../store/store';

export type { MapToolbarStore };

export const useMapToolbarStore = (mapId: string) =>
  createMapScopedStore<MapToolbarStore>(mapId, MAP_STORE_KEY.TOOLBAR, () => {
    logHelper(logger, mapId, 'store')
      .with({ fn: 'useMapToolbarStore', span: 'store.init' })
      .debug('Created scoped map store for mapId.');
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
