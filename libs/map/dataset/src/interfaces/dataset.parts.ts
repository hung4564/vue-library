import { Color, MapSimple } from '@hungpvq/shared-map';
import { AnySourceData } from 'mapbox-gl';
import { IDatasetMap } from './dataset.map';

// === list ===
export type IGroupListViewUI<T> =
  | string
  | {
      name: string;
      id: string;
      children?: T[];
    };
export type IListViewUI = {
  getName: () => string;
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
  setOpacity(map: MapSimple, opacity: number): void;
  toggleShow(map: MapSimple, show?: boolean): void;
  moveLayer(map: MapSimple, beforeId: string): void;
};
