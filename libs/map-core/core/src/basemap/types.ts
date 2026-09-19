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
};

export type BaseMapNoneItem = {
  id: string | number;
  title: string;
  thumbnail: string;
  link: '';
  type: 'no-basemap';
  default?: boolean;
  attribution?: string;
};

export interface IBaseMapLayer {
  setBaseMap(baseMap: BaseMapItem): Promise<void>;
  addToMap(map: MapSimple, beforeId?: string): void;
  removeFromMap(map: MapSimple): void;
}

/** Store bag at `map:core.<mapId>.basemap` (`MAP_STORE_KEY.BASEMAP`). */
export type BaseMapStore = {
  baseMaps: BaseMapItem[];
  current?: BaseMapItem;
  defaultBaseMap: string;
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
    loading: false,
    adapter,
    manager: undefined,
  };
}

export const MittTypeBaseMapEventKey = {
  set: 'map:base-map:set',
  setCurrent: 'map:base-map:set-current',
} as const;

export type MittTypeBaseMap = {
  [MittTypeBaseMapEventKey.set]: BaseMapItem[];
  [MittTypeBaseMapEventKey.setCurrent]: BaseMapItem | undefined;
};
