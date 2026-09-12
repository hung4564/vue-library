import type {
  LayerSpecification,
  MapGeoJSONFeature,
  PointLike,
  SourceSpecification,
} from 'maplibre-gl';
import type { FieldFeaturesDef, WithDataHelper } from '../extra';
import type { MenuItemClick } from '../menu/types';
import type { WithSetOpacity, WithToggleShow } from './dataset.extra';

import type { MapSimple } from '@hungpvq/map-core';
import type { BBox } from 'geojson';
import { ComponentType } from '../types';
import type { IDataset } from './dataset.base';
import type { IDatasetMap } from './dataset.map';

/**
 * Menu Action Types
 * These types define the structure of menu items and actions in the dataset
 */

export type MenuConditionContext<T = IDataset, C = Record<string, unknown>> = {
  layer: T;
  mapId?: string;
  /** External data from UI: React context, Pinia, props, etc. */
  context?: C;
};

export type MenuCondition<T = IDataset, C = Record<string, unknown>> =
  | boolean
  | ((ctx: MenuConditionContext<T, C>) => boolean);

/** Base type for all menu items */
type MenuCommon = {
  order?: number;
  id?: string;
  class?: string;
  disabled?: MenuCondition;
  hidden?: MenuCondition;
};

/** Where a menu action renders in LayerControl. */
export type MenuActionLocation = 'extra' | 'menu' | 'bottom' | 'prebottom';

/** Divider menu item type */
export type MenuDivider = MenuCommon & {
  location?: MenuActionLocation;
  type: 'divider';
};

/** Common properties for all menu items */
export type MenuItemCommon<P = unknown, T = IDataset> = MenuCommon & {
  type: 'item';
  click: MenuItemClick<P, T>;
};

/** Menu item type for bottom or extra location */
export type MenuItemBottomOrExtra<P = unknown, T = IDataset> = MenuItemCommon<
  P,
  T
> & {
  type: 'item';
  location?: Extract<MenuActionLocation, 'bottom' | 'extra'>;
  icon: string;
  name?: string;
};

/** Menu item type custom component for bottom or extra location */
export type MenuItemCustomComponentBottomOrExtra<P = unknown, T = IDataset> = Omit<
  MenuItemCommon<P, T>,
  'click'
> & {
  type: 'item';
  location?: Extract<MenuActionLocation, 'bottom' | 'extra' | 'prebottom'>;
  componentKey: string;
};

/** Menu item type for menu location */
export type MenuItemContentMenu<P = unknown, T = IDataset> = Omit<
  MenuItemCommon<P, T>,
  'click'
> & {
  type: 'item';
  location: Extract<MenuActionLocation, 'menu'>;
  name: string;
  icon?: string;
  click?: MenuItemClick<P, T>;
  /** Registry key of a component that renders this item inside the context menu */
  componentMenuKey?: string;
};
export type MenuAction<P = unknown, T = IDataset> =
  | MenuDivider
  | MenuItemBottomOrExtra<P, T>
  | MenuItemContentMenu<P, T>
  | MenuItemCustomComponentBottomOrExtra<P, T>;

export type IBaseMapboxSourceView = IDatasetMap &
  WithDataHelper &
  IDataset & {
    getMapboxSource: () => SourceSpecification & { id?: string };
    updateData?(map: MapSimple, data: unknown): void;
    getFieldsInfo(): IFieldInfo[];
    getDataInfo(): unknown;
    getSourceId(): string;
  };
export type IMapboxSourceView = IBaseMapboxSourceView & {
  getMapboxSource: () => SourceSpecification & { id?: string };
  updateData?(map: MapSimple, data: unknown): void;
  getFieldsInfo(): IFieldInfo[];
  getDataInfo(): unknown;
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
    updateValue(map: MapSimple, value: unknown): void;
  };
export type IdentifyFeatureRow<TData = unknown> = {
  id: string | number;
  name: string;
  data: TData;
};

export type IIdentifyViewBase = IDataset &
  WithMenuHelper & {
    config: {
      field_name?: string;
      field_id?: string;
      fields?: FieldFeaturesDef;
      /**
       * When true, identify resolver skips auto show-detail / attribute-table
       * for this node and uses the Identify Result panel instead.
       */
      preferResultControl?: boolean;
    };
    group?: {
      name: string;
      id: string;
    };
    getFeatures: (
      mapId: string,
      pointOrBox?: PointLike | [PointLike, PointLike],
    ) => Promise<IdentifyFeatureRow[]>;
    getList?: <T>(mapId: string, features: MapGeoJSONFeature[]) => Promise<T[]>;
  };

// IIdentifyViewWithoutMerge chỉ kế thừa IIdentifyViewBase
export type IIdentifyViewWithoutMerge = IIdentifyViewBase;

// IIdentifyViewWithMerge kế thừa IIdentifyViewBase và thêm các method xử lý merge
export type IIdentifyViewWithMerge = IIdentifyViewBase & {
  identifyGroupId: string;
  mergePayload(
    identifies: IIdentifyView[],
    mapId: string,
    pointOrBox?: PointLike | [PointLike, PointLike],
  ): unknown;

  splitResponse(
    identifies: IIdentifyView[],
    payload: unknown,
    response: unknown,
  ): IdentifyResult[];

  getMergedFeatures(identifies: IIdentifyView[], payload: unknown): unknown;
};

export type IdentifyMultiResult = {
  identify: IIdentifyView;
  features: IdentifyFeatureRow[];
};

/** @deprecated Prefer IdentifyMultiResult — same feature list shape. */
export type IdentifySingleResult = IdentifyMultiResult;

// Define kiểu trả về cho mỗi kết quả sau khi split
export type IdentifyResult = IdentifyMultiResult;
// Union type cho IIdentifyView
export type IIdentifyView = IIdentifyViewWithoutMerge | IIdentifyViewWithMerge;

export type WithMenuHelper<T extends IDataset = IDataset> = {
  addMenu(menu: MenuAction<unknown, T>): void;
  addMenus(menusToAdd: MenuAction<unknown, T>[]): void;
  getMenus(): MenuAction<unknown, T>[];
  removeMenu: (id: string) => void;
  updateMenu: (
    id: string,
    updater: (menu: MenuAction<unknown, T>) => MenuAction<unknown, T>,
  ) => void;
  getMenu(id: string): MenuAction<unknown, T> | undefined;
  hasMenu(id: string): boolean;
};

export type IMetadataView = {
  metadata?: { loading?: boolean; bbox?: BBox };
};

/** Dataset part that stores a layer bounding box via WithDataHelper. */
export type IBoundView = IDataset &
  WithDataHelper<BBox> & {
    type: 'bound';
  };

/** Who consumes a default menu from the shared menu dataset. */
export type DatasetMenuFor = 'item' | 'layer';

/** One default menu stored on a `menu` dataset part. `key` matches `menu.id`. */
export type DatasetMenuEntry = {
  for: DatasetMenuFor;
  key: string;
  menu: MenuAction;
};

/** Shared default menus (`getData` / `setData`) for list, identify, and tables. */
export type IMenuView = IDataset &
  WithDataHelper<DatasetMenuEntry[]> & {
    type: 'menu';
  };

export type IFieldInfo = {
  trans?: string;
  text?: string;
  value: string;
  inline?: boolean;
};
