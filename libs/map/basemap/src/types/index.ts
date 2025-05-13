import type { MapSimple } from '@hungpvq/shared-map';
import { BaseMapAdapter } from '../adapter/base';

export type BaseMapItem =
  | BaseMapVectorItem
  | BaseMapRasterItem
  | BaseMapNoneItem;

export type BaseMapVectorItem = {
  id: string | number;
  title: string;
  links: string[];
  thumbnail: string;
  type: 'vector';
  default?: boolean;
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
};

export type BaseMapNoneItem = {
  id: string | number;
  title: string;
  thumbnail: string;
  link: '';
  type: 'no-basemap';
  default?: boolean;
};

export type BaseMapStore = {
  baseMaps: BaseMapItem[];
  defaultBaseMap: string;
  current?: BaseMapItem;
  loading: boolean;
  adapter: BaseMapAdapter;
};
export type IBaseMapLayer = {
  setBaseMap(baseMap: BaseMapItem): Promise<void>;
  addToMap(map: MapSimple, beforeId?: string): void;
  removeFromMap(map: MapSimple): void;
};
export const MittTypeBaseMapEventKey = {
  set: 'map:base-map:set',
  setCurrent: 'map:base-map:set-current',
} as const;
export type MittTypeBaseMap = {
  [MittTypeBaseMapEventKey.set]: BaseMapItem[];
  [MittTypeBaseMapEventKey.setCurrent]: BaseMapItem | undefined;
};
