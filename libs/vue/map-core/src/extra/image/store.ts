import { logHelper, MAP_STORE_KEY } from '@hungpvq/map-core';
import {
  createDefaultImageStore,
  createMapImageStoreApi,
  type MapImageStore,
} from '@hungpvq/map-core/image';
import { createMapScopedStore, useMapStore } from '../../store/store';
import { logger } from './logger';

export type { MapImageStore };

export const useMapImageStore = (mapId: string) =>
  createMapScopedStore<MapImageStore>(mapId, MAP_STORE_KEY.IMAGE, () => {
    logHelper(logger, mapId, 'store')
      .with({ fn: 'useMapImageStore', span: 'store.init' })
      .debug('init');
    return createDefaultImageStore();
  });

export const useMapImage = (mapId: string) => {
  const store = useMapImageStore(mapId);
  const storeMap = useMapStore(mapId);
  const api = createMapImageStoreApi(store, (fn) => storeMap.getMap(fn));

  return {
    async addImage(
      mapId: string,
      key: string,
      image_url: string,
      option: Parameters<typeof api.addImage>[3] = {},
    ) {
      logHelper(logger, mapId, 'store')
        .with({ fn: 'addImage', span: 'store.add' })
        .debug('addImage', key, image_url, option);
      return api.addImage(mapId, key, image_url, option);
    },
  };
};
