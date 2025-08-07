import type { MaybeRefOrGetter } from '@hungpvq/shared';
import type { MapSimple } from '@hungpvq/shared-map';
import type { IDrawHandler } from '@hungpvq/vue-map-core';
import type { BBox } from 'geojson';
import type {
  LayerSpecification,
  PointLike,
  SourceSpecification,
} from 'maplibre-gl';
import type { ComponentType } from '../types';
import type { IDataset } from './dataset.base';
import type { WithSetOpacity, WithToggleShow } from './dataset.extra';
import type { IDatasetMap } from './dataset.map';

export type MenuItemHandle<T> = (layer: T, map_id: string, value?: any) => any;
export type MenuItemClick<T> =
  | string
  | MenuItemHandle<T>
  | string[]
  | Array<
      | string
      | [
          string,
          (
            | [T, string, any]
            | ((
                layer: T,
                mapId: string,
                value?: any,
              ) => [T, string, any] | undefined)
          ),
        ]
    >;
/**
 * Menu Action Types
 * These types define the structure of menu items and actions in the dataset
 */

/** Base type for all menu items */
type MenuCommon = {
  order?: number;
  id?: string;
  disabled?: MaybeRefOrGetter<boolean>;
  hidden?: MaybeRefOrGetter<boolean>;
};

/** Divider menu item type */
export type MenuDivider = MenuCommon & {
  location?: 'extra' | 'menu' | 'bottom' | 'prebottom';
  type: 'divider';
};

/** Common properties for all menu items */
export type MenuItemCommon<T> = MenuCommon & {
  type: 'item';
  class?: string;
  click: MenuItemClick<T>;
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
  location?: 'bottom' | 'extra' | 'prebottom';
  componentKey: string;
};

/** Menu item type for menu location */
export type MenuItemContentMenu<T> = MenuItemCommon<T> & {
  type: 'item';
  location: 'menu';
  name: string;
  icon?: string;
};
export type MenuAction<T = any> =
  | MenuDivider
  | MenuItemBottomOrExtra<T>
  | MenuItemContentMenu<T>
  | MenuItemCustomComponentBottomOrExtra<T>;

export type IMapboxSourceView = IDatasetMap &
  IDataset & {
    getMapboxSource: () => SourceSpecification & { id?: string };
    updateData?(map: MapSimple, data: any): void;
    getFieldsInfo(): IFieldInfo[];
    getDataInfo(): any;
    getSourceId(): string;
  };

export type IMapboxLayerView = IDatasetMap &
  WithToggleShow &
  WithSetOpacity & {
    getBeforeId(): string;
    getAllLayerIds(): string[];
    moveLayer(map: MapSimple, beforeId: string): void;
    getComponentUpdate(): ComponentType;
    updateValue(map: MapSimple, value: any): void;
  };
export type IIdentifyViewBase<T extends IDataset = IDataset> = IDataset &
  IActionForView<T> & {
    config: { field_name?: string; field_id?: string };
    getFeatures: (
      mapId: string,
      pointOrBox?: PointLike | [PointLike, PointLike],
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
      pointOrBox?: PointLike | [PointLike, PointLike],
    ): any; // Đảm bảo return kiểu hợp lý cho payload

    splitResponse(
      identifies: IIdentifyView<T>[], // Dùng IIdentifyView thay cho IIdentifyViewBase
      payload: any, // Kiểu của payload từ merge
      response: any, // Response từ getMergedFeatures
    ): IdentifyResult[]; // Trả về array kết quả từng identify

    getMergedFeatures(identifies: IIdentifyView<T>[], payload: any): any; // Trả về kết quả đã merge
  };

// Define kiểu trả về cho mỗi kết quả sau khi split
export type IdentifyResult =
  | {
      identify: IIdentifyView; // Dùng IIdentifyView thay cho IIdentifyViewBase
      features: { id: string | number; name: string; data: any }[]; // Features của mỗi identify
    }
  | {
      identify: IIdentifyView; // Dùng IIdentifyView thay cho IIdentifyViewBase
      layer: LayerSpecification;
      feature: { id: string | number; name: string; data: any }; // Features của mỗi identify
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
    updater: (menu: MenuAction<T>) => MenuAction<T>,
  ) => void;
  getMenu(id: string): MenuAction<T> | undefined;
  hasMenu(id: string): boolean;
};

export type IMetadataView = {
  metadata?: { loading?: boolean; bbox?: BBox };
};

export type IDataManagementView<D = any> = IDataset & {
  showDetail(mapId: string, detail: D): void;
  getList(ids?: string[]): Promise<D[]>;
} & IDrawHandler;

export type IFieldInfo = {
  trans?: string;
  text?: string;
  value: string;
  inline?: boolean;
};
