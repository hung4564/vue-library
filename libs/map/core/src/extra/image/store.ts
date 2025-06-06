import { logHelper, MapSimple } from '@hungpvq/shared-map';
import { defineStore } from '@hungpvq/shared-store';
import { useMapStore } from '../../store/store';
import { MAP_STORE_KEY } from '../../types/key';
import { addImageForMap } from './helpers';
import { logger } from './logger';

export type MapImageStore = {
  images: Record<
    string,
    {
      path: string;
      id: string;
      name: string;
      is_sprite: boolean;
      category: 'custom' | string;
    }
  >;
};
export const useMapImageStore = (mapId: string) =>
  defineStore<MapImageStore>(['map:core', mapId, MAP_STORE_KEY.IMAGE], () => {
    logHelper(logger, mapId, 'store').debug('init');
    return { images: {} };
  })();
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
