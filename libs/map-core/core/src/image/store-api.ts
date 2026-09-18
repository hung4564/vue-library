import type { MapSimple } from '../types';
import type { MapImageStore } from './types';
import { addImageForMap, type ImageOptions } from './utils';

/** Matches scoped `storeMap.getMap(cb)` — returns the map, not the callback result. */
export type MapImageGetMapFn = (
  fn: (map: MapSimple) => void | Promise<void>,
) => MapSimple | undefined;

/** Framework-agnostic image store mutations (Vue/React adapters wrap with scoped store + getMap). */
export function createMapImageStoreApi(
  store: MapImageStore,
  getMap: MapImageGetMapFn,
) {
  return {
    async addImage(
      _mapId: string,
      key: string,
      image_url: string,
      option: ImageOptions = {},
    ): Promise<void> {
      store.images[key] = {
        path: image_url,
        id: key,
        name: key,
        is_sprite: false,
        category: 'custom',
      };
      await new Promise<void>((resolve, reject) => {
        getMap((map) => {
          addImageForMap(map, key, image_url, option)
            .then(() => resolve())
            .catch(reject);
        });
      });
    },
  };
}
