import { Color, MapSimple } from '@hungpvq/shared-map';
import { AnySourceData, PointLike } from 'mapbox-gl';
import { IDataset } from './dataset.base';
import { IDatasetMap } from './dataset.map';

export type IGroupListViewUI<T> =
  | string
  | {
      name: string;
      id: string;
      children?: T[];
    };
export type IListViewUI = IDataset & {
  opacity: number;
  selected: boolean;
  metadata: any;
  color?: Color;
  config: {
    disable_delete?: boolean;
    disabled_opacity?: boolean;
    component?: any;
  };
  index: number;
  group?: IGroupListViewUI<IListViewUI>;
  show?: boolean;
};
export type IMapboxSourceView = IDatasetMap & {
  getMapboxSource: () => AnySourceData;
};
export type IMapboxLayerView = IDatasetMap & {
  getBeforeId(): string;
  getAllLayerIds(): string[];
  setOpacity(map: MapSimple, opacity: number): void;
  toggleShow(map: MapSimple, show?: boolean): void;
  moveLayer(map: MapSimple, beforeId: string): void;
};
export type IIdentifyView<T = IDataset> = IDataset &
  IActionForView<T> & {
    config: { field_name?: string; field_id?: string };
    getFeatures: (
      mapId: string,
      pointOrBox?: PointLike | [PointLike, PointLike]
    ) => Promise<{ id: string; name: string; data: any }[]>;
  };

export type IActionForView<T = IDataset> = {
  menus: MenuAction<T>[];
};
export type MenuAction<T> = MenuDivider | MenuItem<T>;
// === action ===
type MenuCommon = {
  location: 'extra' | 'menu' | 'bottom';
  order?: number;
  id?: string;
};
type MenuDivider = MenuCommon & {
  type: 'divider';
};
type MenuItem<T = IDataset> = MenuCommon & {
  type: 'item';
  class?: string;
  click: (layer: T, map_id: string, value?: any) => any;
  icon: string;
  name?: string;
};
