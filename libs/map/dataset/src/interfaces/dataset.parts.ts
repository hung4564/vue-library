import type { Color, MapSimple } from '@hungpvq/shared-map';
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
};

export type IIdentifyView<T extends IDataset = IDataset> = IDataset &
  IActionForView<T> & {
    config: { field_name?: string; field_id?: string };
    getFeatures: (
      mapId: string,
      pointOrBox?: PointLike | [PointLike, PointLike]
    ) => Promise<{ id: string; name: string; data: any }[]>;
  };

export type IActionForView<T extends IDataset = IDataset> = {
  menus: MenuAction<T>[];
  addMenu(menu: MenuAction<T>): void;
  addMenus(menusToAdd: MenuAction<T>[]): void;
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
  | MenuItemContentMenu<T>;

export type IMetadataView = {
  metadata?: { loading?: boolean; bbox?: BBox };
};

export type IDataManagementView<D = any> = {
  showDetail(mapId: string, detail: D): void;
  getList(ids?: string[]): Promise<D[]>;
};

export type IFieldInfo = {
  trans?: string;
  text?: string;
  value: string;
  inline?: boolean;
};
