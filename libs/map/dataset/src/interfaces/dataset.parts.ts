import type { MaybeRefOrGetter } from '@hungpvq/shared';
import type { MapSimple } from '@hungpvq/shared-map';
import type { BBox } from 'geojson';
import type {
  LayerSpecification,
  MapGeoJSONFeature,
  PointLike,
  SourceSpecification,
} from 'maplibre-gl';
import type { FieldFeaturesDef, MenuItemClick, WithDataHelper } from '../extra';
import type { ComponentType } from '../types';
import type { IDataset } from './dataset.base';
import type { WithSetOpacity, WithToggleShow } from './dataset.extra';
import type { IDatasetMap } from './dataset.map';

/**
 * Menu Action Types
 * These types define the structure of menu items and actions in the dataset
 */

/** Base type for all menu items */
type MenuCommon = {
  order?: number;
  id?: string;
  class?: string;
  disabled?: MaybeRefOrGetter<boolean>;
  hidden?: MaybeRefOrGetter<boolean>;
};

/** Divider menu item type */
export type MenuDivider = MenuCommon & {
  location?: 'extra' | 'menu' | 'bottom' | 'prebottom';
  type: 'divider';
};

/** Common properties for all menu items */
export type MenuItemCommon<P = any, T = IDataset> = MenuCommon & {
  type: 'item';
  click: MenuItemClick<P, T>;
};

/** Menu item type for bottom or extra location */
export type MenuItemBottomOrExtra<P = any, T = IDataset> = MenuItemCommon<
  P,
  T
> & {
  type: 'item';
  location?: 'bottom' | 'extra';
  icon: string;
  name?: string;
};

/** Menu item type custom component for bottom or extra location */
export type MenuItemCustomComponentBottomOrExtra<P = any, T = IDataset> = Omit<
  MenuItemCommon<P, T>,
  'click'
> & {
  type: 'item';
  location?: 'bottom' | 'extra' | 'prebottom';
  componentKey: string;
};

/** Menu item type for menu location */
export type MenuItemContentMenu<P = any, T = IDataset> = MenuItemCommon<
  P,
  T
> & {
  type: 'item';
  location: 'menu';
  name: string;
  icon?: string;
};
export type MenuAction<P = any, T = IDataset> =
  | MenuDivider
  | MenuItemBottomOrExtra<P, T>
  | MenuItemContentMenu<P, T>
  | MenuItemCustomComponentBottomOrExtra<P, T>;

export type IBaseMapboxSourceView = IDatasetMap &
  WithDataHelper &
  IDataset & {
    getMapboxSource: () => SourceSpecification & { id?: string };
    updateData?(map: MapSimple, data: any): void;
    getFieldsInfo(): IFieldInfo[];
    getDataInfo(): any;
    getSourceId(): string;
  };
export type IMapboxSourceView = IBaseMapboxSourceView & {
  getMapboxSource: () => SourceSpecification & { id?: string };
  updateData?(map: MapSimple, data: any): void;
  getFieldsInfo(): IFieldInfo[];
  getDataInfo(): any;
  getSourceId(): string;
};

export type IMapboxLayerView = IDatasetMap &
  WithToggleShow &
  WithSetOpacity & {
    getBeforeId(): string | undefined;
    getAllLayerIds(): string[];
    getLayers(): LayerSpecification[];
    moveLayer(map: MapSimple, beforeId: string): void;
    getComponentUpdate(): ComponentType;
    updateValue(map: MapSimple, value: any): void;
  };
export type IIdentifyViewBase = IDataset &
  WithMenuHelper & {
    config: {
      field_name?: string;
      field_id?: string;
      fields?: FieldFeaturesDef;
    };
    group?: {
      name: string;
      id: string;
    };
    getFeatures: (
      mapId: string,
      pointOrBox?: PointLike | [PointLike, PointLike],
    ) => Promise<{ id: string; name: string; data: any }[]>; // Feature's result type
    getList?: <T>(mapId: string, features: MapGeoJSONFeature[]) => Promise<T[]>; // Feature's result type
    showDetail?: (mapId: string, feature: MapGeoJSONFeature) => void; // Feature's result type
  };

// IIdentifyViewWithoutMerge chỉ kế thừa IIdentifyViewBase
export type IIdentifyViewWithoutMerge = IIdentifyViewBase;

// IIdentifyViewWithMerge kế thừa IIdentifyViewBase và thêm các method xử lý merge
export type IIdentifyViewWithMerge = IIdentifyViewBase & {
  identifyGroupId: string;
  mergePayload(
    identifies: IIdentifyView[], // Dùng IIdentifyView thay cho IIdentifyViewBase
    mapId: string,
    pointOrBox?: PointLike | [PointLike, PointLike],
  ): any; // Đảm bảo return kiểu hợp lý cho payload

  splitResponse(
    identifies: IIdentifyView[], // Dùng IIdentifyView thay cho IIdentifyViewBase
    payload: any, // Kiểu của payload từ merge
    response: any, // Response từ getMergedFeatures
  ): IdentifyResult[]; // Trả về array kết quả từng identify

  getMergedFeatures(identifies: IIdentifyView[], payload: any): any; // Trả về kết quả đã merge
};

export type IdentifyMultiResult = {
  identify: IIdentifyView; // Dùng IIdentifyView thay cho IIdentifyViewBase
  features: { id: string | number; name: string; data: any }[]; // Features của mỗi identify
};
export type IdentifySingleResult = {
  identify: IIdentifyView; // Dùng IIdentifyView thay cho IIdentifyViewBase
  layer: LayerSpecification;
  feature: { id: string | number; name: string; data: MapGeoJSONFeature }; // Features của mỗi identify
};

// Define kiểu trả về cho mỗi kết quả sau khi split
export type IdentifyResult = IdentifyMultiResult | IdentifySingleResult;
// Union type cho IIdentifyView
export type IIdentifyView = IIdentifyViewWithoutMerge | IIdentifyViewWithMerge;

export type WithMenuHelper<T extends IDataset = IDataset> = {
  addMenu(menu: MenuAction<T>): void;
  addMenus(menusToAdd: MenuAction<T>[]): void;
  getMenus(): MenuAction<T>[];
  removeMenu: (id: string) => void;
  updateMenu: (
    id: string,
    updater: (menu: MenuAction<T>) => MenuAction<T>,
  ) => void;
  getMenu(id: string): MenuAction<T> | undefined;
  hasMenu(id: string): boolean;
};

export type IMetadataView = {
  metadata?: { loading?: boolean; bbox?: BBox };
};

export type IFieldInfo = {
  trans?: string;
  text?: string;
  value: string;
  inline?: boolean;
};
