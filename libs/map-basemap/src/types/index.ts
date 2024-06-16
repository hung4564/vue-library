import type { MapSimple } from '@hungpv97/shared-map';

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
  layer?: IBaseMapLayer;
  loading: boolean;
};
export type IBaseMapLayer = {
  setBaseMap(baseMap: BaseMapItem): Promise<void>;
  addToMap(map: MapSimple, beforeId?: string): void;
  removeFromMap(map: MapSimple): void;
};
