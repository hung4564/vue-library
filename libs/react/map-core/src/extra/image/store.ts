import { logHelper, MAP_STORE_KEY } from '@hungpvq/map-core';
import {
  createDefaultImageStore,
  createMapImageStoreApi,
  type MapImageStore,
} from '@hungpvq/map-core/image';
import { createMapScopedStore } from '../../store/store-utils';
import { useMapStore } from '../../store/store';
import { loggerFactory } from '@hungpvq/shared-log';

const logger = loggerFactory.createLogger().setNamespace('map:image', 2);

export type { MapImageStore };

export const useMapImageStore = (mapId: string) =>
  createMapScopedStore<MapImageStore>(mapId, MAP_STORE_KEY.IMAGE, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return createDefaultImageStore();
  });

export const useMapImage = (mapId: string) => {
  const store = useMapImageStore(mapId);
  const storeMap = useMapStore(mapId);
  return createMapImageStoreApi(store, (fn) => storeMap.getMap(fn));
};
