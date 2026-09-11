import {
  logHelper,
  MAP_STORE_KEY,
  type ResolvedControlLayout,
} from '@hungpvq/map-core';
import {
  createDefaultToolbarStore,
  createToolbarStoreApi,
  createToolbarModuleApi,
  type MapToolbarStore,
} from '@hungpvq/map-core/toolbar';
import { useMemo, useRef } from 'react';
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
  controlLayout:
    | ResolvedControlLayout
    | 'button'
    | undefined
    | (() => ResolvedControlLayout | 'button' | undefined),
) => {
  const store = useMapToolbarStore(mapId);
  const layoutRef = useRef(controlLayout);
  layoutRef.current = controlLayout;
  return useMemo(
    () =>
      createToolbarModuleApi(store, () => {
        const layout = layoutRef.current;
        return typeof layout === 'function' ? layout() : layout;
      }),
    [store],
  );
};
