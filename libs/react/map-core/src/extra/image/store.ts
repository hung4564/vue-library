import {
  logHelper,
  MapSimple,
  MAP_STORE_KEY,
  addImageForMap,
  createDefaultImageStore,
  type MapImageStore,
} from '@hungpvq/map-core';
import { createMapScopedStore, useMapStore } from '../../store';
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
  return {
    async addImage(
      mapId: string,
      key: string,
      image_url: string,
      option: Parameters<typeof addImageForMap>[3] = {},
    ) {
      store.images[key] = {
        path: image_url,
        id: key,
        name: key,
        is_sprite: false,
        category: 'custom',
      };
      return storeMap.getMap(async (map: MapSimple) =>
        addImageForMap(map, key, image_url, option),
      );
    },
  };
};
