import { MapSimple } from '@hungpvq/shared-map';
import { reactive } from 'vue';
import { addToQueue } from '../../store/queue';
import { addStore, getMap, getStore, store } from '../../store/store';
import { addImageForMap } from './helpers';

const KEY = 'image';
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
  addStore(mapId, KEY, reactive({ images: {} }));
}
addToQueue(KEY, initMapImage);

export async function addImage(
  mapId: string,
  key: string,
  image_url: string,
  option: any = {},
) {
  const storeImage = getStore<MapImageStore>(mapId, KEY);
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
