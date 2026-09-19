/**
 * Public entry for `@hungpvq/map-core/image`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export { logger } from './logger';
export { createDefaultImageStore } from './types';
export { createMapImageStoreApi } from './store-api';
export type { MapImageGetMapFn } from './store-api';
export {
  ensureMapImageApi,
  ensureMapImageStore,
} from './register-domain-store';
export {
  listMapStyleImages,
  subscribeMapStyleImages,
} from './map-images';
export { patchMapStyleImageAccessors } from './patch-map-style-image-accessors';
export {
  addImageForMap,
  loadImage,
  styleImageToDataURL,
  toImageDataFromRGBAImage,
} from './utils';

export type { MapImageEntry, MapImageStore } from './types';
export type { ImageOptions } from './utils';
