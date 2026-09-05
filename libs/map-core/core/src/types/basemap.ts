/**
 * Framework-agnostic basemap types
 */

import type { MapSimple } from './index';

/**
 * Base map item types
 */
export type BaseMapItem =
  | BaseMapVectorItem
  | BaseMapRasterItem
  | BaseMapNoneItem;

/**
 * Vector basemap item
 */
export type BaseMapVectorItem = {
  id: string | number;
  title: string;
  links: string[];
  thumbnail: string;
  type: 'vector';
  default?: boolean;
};

/**
 * Raster basemap item
 */
export type BaseMapRasterItem = {
  id: string | number;
  title: string;
  links: string[];
  thumbnail: string;
  type: 'raster';
  maxzoom?: number;
  minzoom?: number;
  scheme?: string;
  tileSize?: number;
  default?: boolean;
};

/**
 * No basemap item
 */
export type BaseMapNoneItem = {
  id: string | number;
  title: string;
  thumbnail: string;
  link: '';
  type: 'no-basemap';
  default?: boolean;
};

/**
 * Base map layer interface
 * Implementations should provide methods to manage basemap layers on the map
 */
export interface IBaseMapLayer {
  /**
   * Set the basemap for this layer
   */
  setBaseMap(baseMap: BaseMapItem): Promise<void>;

  /**
   * Add the layer to the map
   */
  addToMap(map: MapSimple, beforeId?: string): void;

  /**
   * Remove the layer from the map
   */
  removeFromMap(map: MapSimple): void;
}

/**
 * Base map store state type
 * Framework-specific stores should use this type for their state
 */
export type BaseMapStore = {
  baseMaps: BaseMapItem[];
  defaultBaseMap: string;
  current?: BaseMapItem;
  loading: boolean;
  // Note: adapter is framework-specific, should be typed in framework package
  adapter: any;
};

/**
 * Base map event keys
 */
export const MittTypeBaseMapEventKey = {
  set: 'map:base-map:set',
  setCurrent: 'map:base-map:set-current',
} as const;

/**
 * Base map event types
 */
export type MittTypeBaseMap = {
  [MittTypeBaseMapEventKey.set]: BaseMapItem[];
  [MittTypeBaseMapEventKey.setCurrent]: BaseMapItem | undefined;
};
