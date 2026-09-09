/**
 * Public entry for `@hungpvq/map-core/basemap`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export { BaseMapAdapter } from './adapter/BaseMapAdapter';
export {
  DefaultBaseMapAdapter,
  getLowestLayerId,
} from './adapter/DefaultBaseMapAdapter';
export { BasemapManager } from './basemap-manager.service';
export { BasemapService } from './basemap.service';
export { BasemapError } from './errors';
export { INIT_BASEMAPS } from './init';
export { BASEMAP_CONTROL_LOCALE } from './locale';
export { BASEMAP_PREFIX, BaseMapLayer } from './model/BaseMapLayer';
export { MittTypeBaseMapEventKey } from './types';

export type {
  BaseMapItem,
  BaseMapNoneItem,
  BaseMapRasterItem,
  BaseMapStore,
  BaseMapVectorItem,
  IBaseMapLayer,
  MittTypeBaseMap,
} from './types';
