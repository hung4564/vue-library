import {
  logHelper,
  MapSimple,
  MAP_STORE_KEY,
  addImageForMap,
  createDefaultImageStore,
  type MapImageStore,
} from '@hungpvq/map-core';
import { createMapScopedStore, useMapStore } from '../../store';
import { logger } from './logger';

export type { MapImageStore };

export const useMapImageStore = (mapId: string) =>
  createMapScopedStore<MapImageStore>(mapId, MAP_STORE_KEY.IMAGE, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return createDefaultImageStore();
  });
export const useMapImage = (mapId: string) => {
  const store = useMapImageStore(mapId);
  const storeMap = useMapStore(mapId);
  return {
    async addImage(
      mapId: string,
      key: string,
      image_url: string,
      option: any = {},
    ) {
      logHelper(logger, mapId, 'store').debug(
        'addImage',
        key,
        image_url,
        option,
      );
      store.images[key] = {
        path: image_url,
        id: key,
        name: key,
        is_sprite: false,
        category: 'custom',
      };
      const promises = storeMap.getMap(async (map: MapSimple) =>
        addImageForMap(map, key, image_url, option),
      );
      return promises;
    },
  };
};
