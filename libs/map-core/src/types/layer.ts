import type { Color, MapSimple } from '@hungpvq/shared-map';
import { BBox } from '@turf/turf';
import { VueElement } from 'vue';
export type TYPE_VIEW = {
  component: ILayerComponentView;
  action: IActionView;
  source: ISourceView;
  list: IListView;
  identify: ILayerIdentifyView;
  map: ILayerMapView;
  [key: string]: IView;
};
export type TYPE_VIEW_NAME = keyof TYPE_VIEW | string;
// === example ===
// === example end ===

// === list ===
export type IGroupListView<T = IView> =
  | string
  | {
      name: string;
      id: string;
      children?: T[];
    };
export interface ListOption {
  disable_delete?: boolean;
  disabled_opacity?: boolean;
  color?: Color;
  group?: IGroupListView;
  show?: boolean;
  opacity?: number;
}
export type IListView = IView & {
  name?: string;
  opacity: number;
  selected: boolean;
  metadata: any;
  color: Color;
  config: {
    disable_delete: boolean;
    disabled_opacity: boolean;
    component: any;
  };
  index: number;
  group?: IGroupListView;
  multi: boolean;
  show: any;
};
// === list end ===

// === component ===
export type ILayerComponentItem = {
  id: string;
};

export type ILayerComponentView = IView & {
  add(component: ILayerComponentItem): any;
  remove(component: ILayerComponentItem): any;
  setFromAction(menu: LayerAction): any;
};
// === component end ===

// === action ===
type MenuCommon = {
  location: 'extra' | 'menu';
  order?: number;
};
export type MenuDivider = MenuCommon & {
  type: 'divider';
};
type componentFC = () => any;
export type MenuItem = MenuCommon & {
  id: string;
  type: 'item';
  class?: string;
  name: string | componentFC;
  click?: (layer: ILayer, map_id: string) => any;
  icon?: string | componentFC;
  attr?: any;
};
export type Menu = MenuDivider | MenuItem;

export type LayerAction = {
  id: string;
  component?: () => VueElement;
  menu: Menu;
  type?: string;
  option?: any;
};
export type LayerActionOption = {
  actions: LayerAction[];
};
export interface IActionView extends IView {
  call: (id: string, map_id: string) => any;
  menus?: Menu[];
  get(id: string): LayerAction;
  addActions(actions: LayerAction[]): any;
  addAction(action: LayerAction): any;
  updateAction(action: LayerAction): any;
}
// === action end ===

// === source ===
export type ISourceView = IView & {
  getMapboxSource: () => object;
  updateForMap: (map: MapSimple) => void;
  addToMap: (map: MapSimple) => void;
  removeFromMap: (map: MapSimple) => void;
  bounds: BBox;
};
// === source - end ===

// === identify ===
export type ILayerIdentifyView = IView & {
  id: string;
  name: string;
  config: { field_name: string; field_id: string };
};
export interface IIdentifyOption {
  field_id?: string;
  field_name?: string;
}

// === identify end ===

// === map ===
export type ILayerMapView = IView & {
  getBeforeId(): string;
  getAllLayerIds(): string[];
  addToMap(map: MapSimple, beforeId: string): void;
  removeFromMap(map: MapSimple): void;
  moveLayer(map: MapSimple, beforeId: string): void;
  toggleShow(map: MapSimple, show: boolean): void;
  setOpacity(map: MapSimple, opacity: number): void;
  getValue(): any;
  getComponentUpdate(): any;
  updateValue(map: MapSimple, value: any): void;
};
// === map end ===

export interface IView {
  id: string;
  parent?: ILayer;
  setParent(_parent: ILayer): void;
}

export type LayerBuildFunction<
  IReturn extends IView = IView,
  IOption extends object = any
> = {
  (layer: ILayer, option: IOption): IReturn;
};
export interface LayerInfo {
  metadata: {
    loading?: boolean;
    bounds?: BBox;
  };
  name?: string;
}
export interface ILayer {
  info: LayerInfo;
  get metadata(): any;
  get id(): string;
  get name(): string | undefined;
  run(key: string, map: MapSimple, ...args: any[]): Promise<any>;
  addToMap(map: MapSimple, ...args: any[]): Promise<any>;
  removeFromMap(map: MapSimple, ...args: any[]): Promise<any>;
  updateForMap(map: MapSimple, ...args: any[]): Promise<any>;
  setInfo(info: LayerInfo): ILayer;
  setView(key: string, view: IView): ILayer;
  getView<T extends TYPE_VIEW_NAME>(key: T): TYPE_VIEW[T];
  on<T extends ILayerEventName>(
    key: T,
    cb: (data: ILayerEvent[T]) => void
  ): ILayer;
  off<T extends ILayerEventName>(
    key: T,
    cb: (data: ILayerEvent[T]) => void
  ): ILayer;
  emit<T extends ILayerEventName>(key: T, data: ILayerEvent[T]): ILayer;
}

export type ILayerEvent = {
  'add-component': { layer: ILayer; component: IEventComponentItem };
};
export type ILayerEventName = keyof ILayerEvent;

export interface IEventComponentItem {
  id: string;
  component: any;
  option: any;
  open?: () => void;
  close?: () => void;
}
