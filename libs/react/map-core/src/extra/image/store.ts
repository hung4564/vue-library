import { logHelper, MAP_STORE_KEY } from '@hungpvq/map-core';
import {
  createDefaultImageStore,
  createMapImageStoreApi,
  type MapImageStore,
  logger,
} from '@hungpvq/map-core/image';
import { createMapScopedStore } from '../../store/store';
import { useMapStore } from '../../store/store';

export type { MapImageStore };

export const useMapImageStore = (mapId: string) =>
  createMapScopedStore<MapImageStore>(mapId, MAP_STORE_KEY.IMAGE, () => {
    logHelper(logger, mapId, 'store')
      .with({ fn: 'useMapImageStore', span: 'store.init' })
      .debug('Created scoped map store for mapId.');
    return createDefaultImageStore();
  });

export const useMapImage = (mapId: string) => {
  const store = useMapImageStore(mapId);
  const storeMap = useMapStore(mapId);
  return createMapImageStoreApi(store, (fn) => storeMap.getMap(fn));
};
