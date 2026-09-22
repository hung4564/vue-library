/**
 * Public entry for `@hungpvq/map-core/basemap`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export { BaseMapAdapter } from './adapter/BaseMapAdapter';
export {
  createDefaultBaseMapAdapter,
  createDefaultBaseMapAdapterClass,
  DefaultBaseMapAdapter,
  getLowestLayerId,
} from './adapter/DefaultBaseMapAdapter';
export type { DefaultBaseMapAdapterConstructor } from './adapter/DefaultBaseMapAdapter';
export { subscribeBasemapMirror } from './basemap-mirror';
export type { BasemapMirrorHandlers } from './basemap-mirror';
export {
  BasemapManager,
  getOrCreateBasemapManager,
} from './basemap-manager.service';
export { BasemapService } from './basemap.service';
export { BasemapError } from './errors';
export { INIT_BASEMAPS } from './init';
export { BASEMAP_CONTROL_LOCALE } from './locale';
export { logger } from './logger';
export { BASEMAP_PREFIX, BaseMapLayer, getBasemapOpacityPaintKeys } from './model/BaseMapLayer';
export { ensureMapBaseMapStore } from './register-domain-store';
export { MittTypeBaseMapEventKey, createDefaultBaseMapStore } from './types';
export { createCustomBasemapItem, isCustomBasemapItem } from './create-custom-basemap';
export type { CreateCustomBasemapInput } from './create-custom-basemap';
export {
  buildSampleRasterTileUrl,
  isAbsoluteHttpUrl,
  isMapLibreStyleLike,
  isValidRasterTileTemplate,
  validateBasemapSource,
} from './validate-basemap-source';
export type {
  BasemapSourceType,
  BasemapSourceValidationFail,
  BasemapSourceValidationOk,
  BasemapSourceValidationResult,
  ValidateBasemapSourceInput,
} from './validate-basemap-source';

export type {
  BaseMapItem,
  BaseMapNoneItem,
  BaseMapRasterItem,
  BaseMapStore,
  BaseMapVectorItem,
  IBaseMapLayer,
  MittTypeBaseMap,
} from './types';
