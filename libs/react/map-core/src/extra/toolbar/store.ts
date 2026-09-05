import {
  logHelper,
  MAP_STORE_KEY,
  createDefaultToolbarStore,
  createToolbarStoreApi,
  createToolbarModuleApi,
  type MapToolbarStore,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { useMemo } from 'react';
import { createMapScopedStore } from '../../store';
import { loggerFactory } from '@hungpvq/shared-log';

const logger = loggerFactory.createLogger().setNamespace('map:toolbar', 2);

export type { MapToolbarStore };

export const useMapToolbarStore = (mapId: string) =>
  createMapScopedStore<MapToolbarStore>(mapId, MAP_STORE_KEY.TOOLBAR, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return createDefaultToolbarStore();
  });

export const useMapToolbar = (mapId: string) => {
  const store = useMapToolbarStore(mapId);
  return useMemo(() => createToolbarStoreApi(store), [store]);
};

export const useMapToolbarModule = (
  mapId: string,
  controlLayout: WithMapPropType['controlLayout'],
) => {
  const store = useMapToolbarStore(mapId);
  return useMemo(
    () => createToolbarModuleApi(store, controlLayout),
    [store, controlLayout],
  );
};
