import { logHelper, MapSimple } from '@hungpvq/shared-map';
import { addToQueue } from '../../store/queue';
import { addStore, getMap, getStore } from '../../store/store';
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
export function initMapImage(mapId: string) {
  logHelper(logger, mapId, 'store').debug('init');
  addStore(mapId, MAP_STORE_KEY.IMAGE, { images: {} });
}
addToQueue(MAP_STORE_KEY.IMAGE, initMapImage);

export async function addImage(
  mapId: string,
  key: string,
  image_url: string,
  option: any = {},
) {
  logHelper(logger, mapId, 'store').debug('addImage', key, image_url, option);
  const storeImage = getStore<MapImageStore>(mapId, MAP_STORE_KEY.IMAGE);
  storeImage.images[key] = {
    path: image_url,
    id: key,
    name: key,
    is_sprite: false,
    category: 'custom',
  };
  const promises = getMap(mapId, async (map: MapSimple) =>
    addImageForMap(map, key, image_url, option),
  );
  return promises;
}
