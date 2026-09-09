/**
 * Public entry for `@hungpvq/map-core/image`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export { createDefaultImageStore } from './types';
export {
  addImageForMap,
  loadImage,
  styleImageToDataURL,
  toImageDataFromRGBAImage,
} from './utils';

export type { MapImageEntry, MapImageStore } from './types';
export type { ImageOptions } from './utils';
