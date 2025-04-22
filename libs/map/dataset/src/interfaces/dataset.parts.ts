import type { Color, MapSimple } from '@hungpvq/shared-map';
import { IDrawHandler } from '@hungpvq/vue-map-core';
import type { BBox } from 'geojson';
import type { AnySourceData, PointLike } from 'mapbox-gl';
import type { IDataset } from './dataset.base';
import type { IDatasetMap } from './dataset.map';

/**
 * Menu Action Types
 * These types define the structure of menu items and actions in the dataset
 */

/** Base type for all menu items */
type MenuCommon = {
  order?: number;
  id?: string;
};

/** Divider menu item type */
type MenuDivider = MenuCommon & {
  location?: 'extra' | 'menu' | 'bottom';
  type: 'divider';
};

/** Common properties for all menu items */
type MenuItemCommon<T> = MenuCommon & {
  type: 'item';
  class?: string;
  click: (layer: T, map_id: string, value?: any) => any;
};

/** Menu item type for bottom or extra location */
export type MenuItemBottomOrExtra<T> = MenuItemCommon<T> & {
  type: 'item';
  location?: 'bottom' | 'extra';
  icon: string;
  name?: string;
};

/** Menu item type custom component for bottom or extra location */
export type MenuItemCustomComponentBottomOrExtra<T> = Omit<
  MenuItemCommon<T>,
  'click'
> & {
  type: 'item';
  location?: 'bottom' | 'extra';
  component: () => any;
};

/** Menu item type for menu location */
type MenuItemContentMenu<T> = MenuItemCommon<T> & {
  type: 'item';
  location: 'menu';
  name: string;
  icon?: string;
};

/**
 * View Interface Types
 * These types define the structure of different view interfaces
 */

export type IGroupListViewUI<T> =
  | string
  | {
      name: string;
      id: string;
      children?: T[];
    };

export type IListViewUI<T extends IDataset = IDataset> = T &
  IActionForView<T> & {
    opacity: number;
    selected: boolean;
    color?: Color;
    config: {
      disable_delete?: boolean;
      disabled_opacity?: boolean;
      component?: any;
    };
    index: number;
    group?: IGroupListViewUI<IListViewUI>;
    show?: boolean;
    shows: boolean[];
    legend?: () => any;
  };

export type IMapboxSourceView = IDatasetMap & {
  getMapboxSource: () => AnySourceData;
  updateData?(map: MapSimple, data: any): void;
  getFieldsInfo(): IFieldInfo[];
  getDataInfo(): any;
};

export type IMapboxLayerView = IDatasetMap & {
  getBeforeId(): string;
  getAllLayerIds(): string[];
  setOpacity(map: MapSimple, opacity: number): void;
  toggleShow(map: MapSimple, show?: boolean): void;
  moveLayer(map: MapSimple, beforeId: string): void;
  getComponentUpdate(): () => any;
  updateValue(map: MapSimple, value: any): void;
};
export type IIdentifyViewBase<T extends IDataset = IDataset> = IDataset &
  IActionForView<T> & {
    config: { field_name?: string; field_id?: string };
    getFeatures: (
      mapId: string,
      pointOrBox?: PointLike | [PointLike, PointLike]
    ) => Promise<{ id: string; name: string; data: any }[]>; // Feature's result type
  };

// IIdentifyViewWithoutMerge chỉ kế thừa IIdentifyViewBase
export type IIdentifyViewWithoutMerge<T extends IDataset = IDataset> =
  IIdentifyViewBase<T>;

// IIdentifyViewWithMerge kế thừa IIdentifyViewBase và thêm các method xử lý merge
export type IIdentifyViewWithMerge<T extends IDataset = IDataset> =
  IIdentifyViewBase<T> & {
    identifyGroupId: string;
    mergePayload(
      identifies: IIdentifyView<T>[], // Dùng IIdentifyView thay cho IIdentifyViewBase
      mapId: string,
      pointOrBox?: PointLike | [PointLike, PointLike]
    ): any; // Đảm bảo return kiểu hợp lý cho payload

    splitResponse(
      identifies: IIdentifyView<T>[], // Dùng IIdentifyView thay cho IIdentifyViewBase
      payload: any, // Kiểu của payload từ merge
      response: any // Response từ getMergedFeatures
    ): IdentifyResult[]; // Trả về array kết quả từng identify

    getMergedFeatures(identifies: IIdentifyView<T>[], payload: any): any; // Trả về kết quả đã merge
  };

// Define kiểu trả về cho mỗi kết quả sau khi split
export type IdentifyResult = {
  identify: IIdentifyView; // Dùng IIdentifyView thay cho IIdentifyViewBase
  features: { id: string | number; name: string; data: any }[]; // Features của mỗi identify
};
// Union type cho IIdentifyView
export type IIdentifyView<T extends IDataset = IDataset> =
  | IIdentifyViewWithoutMerge<T>
  | IIdentifyViewWithMerge<T>;

export type IActionForView<T extends IDataset = IDataset> = {
  addMenu(menu: MenuAction<T>): void;
  addMenus(menusToAdd: MenuAction<T>[]): void;
  getMenus(): MenuAction<T>[];
  removeMenu: (id: string) => void;
  updateMenu: (
    id: string,
    updater: (menu: MenuAction<T>) => MenuAction<T>
  ) => void;
  getMenu(id: string): MenuAction<T> | undefined;
  hasMenu(id: string): boolean;
};

export type MenuAction<T> =
  | MenuDivider
  | MenuItemBottomOrExtra<T>
  | MenuItemContentMenu<T>
  | MenuItemCustomComponentBottomOrExtra<T>;

export type IMetadataView = {
  metadata?: { loading?: boolean; bbox?: BBox };
};

export type IDataManagementView<D = any> = {
  showDetail(mapId: string, detail: D): void;
  getList(ids?: string[]): Promise<D[]>;
} & IDrawHandler;

export type IFieldInfo = {
  trans?: string;
  text?: string;
  value: string;
  inline?: boolean;
};
