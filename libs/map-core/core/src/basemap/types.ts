/**
 * Framework-agnostic basemap types
 */

import type { MapSimple } from '../types';
import type { BaseMapAdapter } from './adapter/BaseMapAdapter';

export type BaseMapItem =
  BaseMapVectorItem | BaseMapRasterItem | BaseMapNoneItem;

export type BaseMapVectorItem = {
  id: string | number;
  title: string;
  links: string[];
  thumbnail: string;
  type: 'vector';
  default?: boolean;
  attribution?: string;
  /** User-added basemap; removable from the picker when true. */
  custom?: boolean;
};

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
  attribution?: string;
  /** User-added basemap; removable from the picker when true. */
  custom?: boolean;
};

export type BaseMapNoneItem = {
  id: string | number;
  title: string;
  thumbnail: string;
  link: '';
  type: 'no-basemap';
  default?: boolean;
  attribution?: string;
  /** User-added basemap; removable from the picker when true. */
  custom?: boolean;
};

export interface IBaseMapLayer {
  setBaseMap(baseMap: BaseMapItem): Promise<void>;
  addToMap(map: MapSimple, beforeId?: string): void;
  removeFromMap(map: MapSimple): void;
  setOpacity(map: MapSimple, opacity: number): void;
}

/** Store bag at `map:core.<mapId>.basemap` (`MAP_STORE_KEY.BASEMAP`). */
export type BaseMapStore = {
  baseMaps: BaseMapItem[];
  current?: BaseMapItem;
  defaultBaseMap: string;
  /** Basemap paint opacity in `[0, 1]` (default `1`). */
  opacity: number;
  loading: boolean;
  adapter: BaseMapAdapter;
  /** Lazily attached by {@link getOrCreateBasemapManager} */
  manager?: import('./basemap-manager.service').BasemapManager;
};

export function createDefaultBaseMapStore(
  adapter: BaseMapAdapter,
): BaseMapStore {
  return {
    baseMaps: [],
    defaultBaseMap: '',
    current: undefined,
    opacity: 1,
    loading: false,
    adapter,
    manager: undefined,
  };
}

export const MittTypeBaseMapEventKey = {
  set: 'map:base-map:set',
  setCurrent: 'map:base-map:set-current',
  setOpacity: 'map:base-map:set-opacity',
} as const;

export type MittTypeBaseMap = {
  [MittTypeBaseMapEventKey.set]: BaseMapItem[];
  [MittTypeBaseMapEventKey.setCurrent]: BaseMapItem | undefined;
  [MittTypeBaseMapEventKey.setOpacity]: number;
};
