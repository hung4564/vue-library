import type { Feature, Geometry } from 'geojson';
import type { IDataset } from '../../interfaces';
export type ID = string | number;
export type Identifiable = {
  id?: ID;
  [key: string]: any;
};

export type IDataManagerProps<
  T extends Identifiable,
  Hooks = IDataManagerHook<T>,
  Adapter extends IDataAdapter<any> = IDataAdapter<T>,
> = {
  source: string;
  adapter: Adapter;
  mapper?: IDataMapper<T, Adapter extends IDataAdapter<infer U> ? U : T>;
  hooks?: Hooks[];
};
export interface IDataAdapter<T> extends Record<string, (...args: any) => any> {
  list(params?: any): Promise<T[]>;
  create(item: Partial<T>): Promise<T>;
  getDetail(item: Partial<T>): Promise<T | undefined>;
  update(item: T | Partial<T>): Promise<T>;
  delete(item: T | Partial<T>): Promise<void>;
}
export interface IDataMapper<E, T> {
  fromExternal(data: E | undefined | void): T | undefined;
  toExternal(data: T | undefined | void): E | undefined;
  toFeature(data: E | undefined | void): T | undefined;
  toItem(data: T | undefined | void): E | undefined;
}
export interface IDataManager<
  T extends Identifiable,
  Params extends Record<string, unknown> = Record<string, unknown>,
> {
  list(params?: Params): Promise<T[]>;
  create(item: Partial<T>): Promise<T | void>;
  update(item: T | Partial<T>): Promise<T | void>;
  delete(item: T | Partial<T>): Promise<T | void>;
  getDetail(item: Partial<T>): Promise<T | undefined>;
}
export type HandleWithHooksFn<T extends Identifiable = Identifiable> = <
  Action extends string,
>(
  action: Action,
  payload: HookPayload<T, Action>,
  hookPrefix: string,
  executor: (payload: HookPayload<T, Action>) => Promise<any> | any,
) => Promise<HookPayload<T, Action> | void>;

export type IDataManagementView<
  T extends Identifiable = Identifiable,
  Adapter extends IDataAdapter<any> = IDataAdapter<T>,
> = IDataset &
  IDataManager<T> & {
    adapter: Adapter;
    mapper: IDataMapper<T, Adapter extends IDataAdapter<infer U> ? U : T>;
    handWithFeature(
      item: Feature<Geometry, T>,
      cb: (item: T) => Promise<T | Partial<T> | void | undefined>,
    ): Promise<Feature<Geometry, T> | undefined>;
    cancel(item?: T): Promise<void | T>;
    handleWithHooks: HandleWithHooksFn<T>;
    redraw(mapId: string): Promise<void> | void;
  };
export type IDataManagementDraft<
  T extends Identifiable = Identifiable,
  Adapter extends IDataAdapter<any> = IDataAdapter<T>,
> = IDataset &
  IDataManager<T> & {
    adapter: Adapter;
    mapper: IDataMapper<T, Adapter extends IDataAdapter<infer U> ? U : T>;
    handWithFeature(
      item: Feature<Geometry, T> | undefined,
      cb: (item: T) => Promise<T | Partial<T> | void | undefined>,
    ): Promise<Feature<Geometry, T> | undefined>;
    cancel(item?: T): Promise<void>;
    commit(): Promise<void>;
    discard(item?: IDraftRecord<T>): Promise<void>;
  };

export type IDraftDataManagementView<T extends Identifiable> = IDataset &
  IDataManagementDraft<T> & {
    handleWithHooks: HandleWithHooksFn<T>;
    redraw(mapId: string): Promise<void> | void;
    getDraftItems(): IDraftRecord<T>[];
  };

export type IDraftRecord<T = any> = {
  id: ID;
  original?: Feature<Geometry, Partial<T> | T>;
  modified?: Feature<Geometry, Partial<T> | T>;
  status: 'created' | 'updated' | 'deleted';
};

type CRUD = 'Create' | 'Update' | 'Delete' | 'GetDetail' | 'Cancel';
type DraftCRUD = 'Commit' | 'Discard';
export type HookPayload<
  T extends Identifiable,
  Action extends string,
> = Action extends 'Commit'
  ? IDraftRecord<T | Partial<T>>[]
  : Action extends 'Discard'
    ? IDraftRecord<T | Partial<T>> | undefined
    : Action extends 'Cancel'
      ? T | Partial<T> | undefined
      : T | Partial<T>;

export type IHookContext<
  T extends Identifiable,
  Action extends string,
  IDataAdapterItem = any,
> = {
  payload?: HookPayload<T, Action>;
  adapter: IDataAdapter<IDataAdapterItem>;
  action: Action;
  mapper: IDataMapper<any, any>;
  result?: any;
};

export type HookBeforeHandler<T extends Identifiable, Action extends string> = (
  ctx: IHookContext<T, Action>,
) =>
  | boolean
  | void
  | HookPayload<T, Action>
  | Partial<HookPayload<T, Action>>
  | { cancel: true; returnValue?: Partial<HookPayload<T, Action>> }
  | Promise<
      | boolean
      | void
      | HookPayload<T, Action>
      | Partial<HookPayload<T, Action>>
      | { cancel: true; returnValue?: Partial<HookPayload<T, Action>> }
    >;

export type HookAfterHandler<T extends Identifiable, Action extends string> = (
  ctx: IHookContext<T, Action>,
) => void | Promise<void>;

export type IDataManagerBeforeHook<T extends Identifiable> = {
  [K in CRUD as `before${K}`]?: HookBeforeHandler<T, K>;
};
export type IDataManagerAfterHook<T extends Identifiable> = {
  [K in CRUD as `after${K}`]?: HookAfterHandler<T, K>;
};
export type IDataManagerHook<T extends Identifiable> = {
  [K in CRUD as `before${K}`]?: HookBeforeHandler<T, K>;
} & {
  [K in CRUD as `after${K}`]?: HookAfterHandler<T, K>;
};
export type IDataDraftManagerHook<T extends Identifiable> = {
  [K in CRUD as `before${K}`]?: HookBeforeHandler<T, K>;
} & {
  [K in CRUD as `after${K}`]?: HookAfterHandler<T, K>;
} & {
  [K in Exclude<
    CRUD,
    'GetDetail' | 'Cancel'
  > as `beforeDraft${K}`]?: HookBeforeHandler<T, K>;
} & {
  [K in Exclude<
    CRUD,
    'GetDetail' | 'Cancel'
  > as `afterDraft${K}`]?: HookAfterHandler<T, K>;
} & {
  [K in DraftCRUD as `beforeDraft${K}`]?: HookBeforeHandler<T, K>;
} & {
  [K in DraftCRUD as `afterDraft${K}`]?: HookAfterHandler<T, K>;
};
