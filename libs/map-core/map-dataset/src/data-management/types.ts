import type { IDataset } from '../interfaces';
import type { Geometry } from 'geojson';

export type ID = string | number;

export type DataRecord = {
  id?: ID;
  geometry?: Geometry | null;
  [key: string]: unknown;
};

export type RecordId = { id: ID };

export type PageQuery = {
  page?: number;
  pageSize?: number | 'all';
  search?: string;
  sort?: { field: string; dir: 'asc' | 'desc' };
  filter?: Record<string, unknown>;
  point?: [number, number];
  bbox?: [number, number, number, number];
};

export type PageResult<T = DataRecord> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type DataFormat = 'auto' | 'feature-collection' | 'list';

export interface DataStore<T extends DataRecord = DataRecord> {
  list(query?: PageQuery): Promise<PageResult<T>>;
  get(id: ID): Promise<T | undefined>;
  create(patch: Partial<T>): Promise<T>;
  update(patch: Partial<T> & RecordId): Promise<T>;
  delete(id: ID): Promise<void>;
}

export type DraftStatus = 'created' | 'updated' | 'deleted';

export type DraftRecord<T extends DataRecord = DataRecord> = {
  id: ID;
  original?: T;
  modified?: T;
  status: DraftStatus;
};

export type DataHookAction =
  | 'Create'
  | 'Update'
  | 'Delete'
  | 'Get'
  | 'Cancel'
  | 'DraftCreate'
  | 'DraftUpdate'
  | 'DraftDelete'
  | 'DraftCommit'
  | 'DraftDiscard';

export type DataHookContext<T extends DataRecord = DataRecord> = {
  action: DataHookAction;
  payload?: unknown;
  result?: unknown;
  store: DataStore<T>;
};

export type DataHookBeforeResult =
  | boolean
  | void
  | { cancel: true; returnValue?: unknown }
  | Record<string, unknown>;

export type DataHook = {
  beforeCreate?: (
    ctx: DataHookContext,
  ) => DataHookBeforeResult | Promise<DataHookBeforeResult>;
  afterCreate?: (ctx: DataHookContext) => void | Promise<void>;
  beforeUpdate?: (
    ctx: DataHookContext,
  ) => DataHookBeforeResult | Promise<DataHookBeforeResult>;
  afterUpdate?: (ctx: DataHookContext) => void | Promise<void>;
  beforeDelete?: (
    ctx: DataHookContext,
  ) => DataHookBeforeResult | Promise<DataHookBeforeResult>;
  afterDelete?: (ctx: DataHookContext) => void | Promise<void>;
  beforeGet?: (
    ctx: DataHookContext,
  ) => DataHookBeforeResult | Promise<DataHookBeforeResult>;
  afterGet?: (ctx: DataHookContext) => void | Promise<void>;
  beforeCancel?: (
    ctx: DataHookContext,
  ) => DataHookBeforeResult | Promise<DataHookBeforeResult>;
  afterCancel?: (ctx: DataHookContext) => void | Promise<void>;
  beforeDraftCreate?: (
    ctx: DataHookContext,
  ) => DataHookBeforeResult | Promise<DataHookBeforeResult>;
  afterDraftCreate?: (ctx: DataHookContext) => void | Promise<void>;
  beforeDraftUpdate?: (
    ctx: DataHookContext,
  ) => DataHookBeforeResult | Promise<DataHookBeforeResult>;
  afterDraftUpdate?: (ctx: DataHookContext) => void | Promise<void>;
  beforeDraftDelete?: (
    ctx: DataHookContext,
  ) => DataHookBeforeResult | Promise<DataHookBeforeResult>;
  afterDraftDelete?: (ctx: DataHookContext) => void | Promise<void>;
  beforeDraftCommit?: (
    ctx: DataHookContext,
  ) => DataHookBeforeResult | Promise<DataHookBeforeResult>;
  afterDraftCommit?: (ctx: DataHookContext) => void | Promise<void>;
  beforeDraftDiscard?: (
    ctx: DataHookContext,
  ) => DataHookBeforeResult | Promise<DataHookBeforeResult>;
  afterDraftDiscard?: (ctx: DataHookContext) => void | Promise<void>;
};

export type NormalizeOptions = {
  idField?: string;
  geometryFields?: string[];
};

export type LocalStoreOptions = NormalizeOptions & {
  persistKey?: string;
  initData?: unknown;
  format?: DataFormat;
};

export type HttpStoreQueryKeys = {
  page?: string;
  pageSize?: string;
  search?: string;
};

export type HttpListResponse<T = DataRecord> = {
  data: T[];
  meta: { total: number; page: number; pageSize: number };
};

export type HttpStoreOptions = NormalizeOptions & {
  baseUrl: string;
  geometryField?: string;
  query?: HttpStoreQueryKeys;
  /** Map a non-standard list JSON body to `{ data, meta }`. */
  parseList?: (json: unknown) => HttpListResponse;
  /** Map a non-standard item JSON (get/create/update response) to a record-like object. */
  parseItem?: (json: unknown) => unknown;
  /** Map a canonical record to the API write body. */
  serializeBody?: (record: DataRecord) => unknown;
  fetch?: typeof fetch;
};

export type CreateDataManagementOptions<T extends DataRecord = DataRecord> = {
  store: 'local' | 'http' | DataStore<T>;
  format?: DataFormat;
  geometryFields?: string[];
  idField?: string;
  persistKey?: string;
  initData?: unknown;
  http?: HttpStoreOptions;
  draft?: boolean;
  syncMap?: boolean;
  hooks?: DataHook | DataHook[];
};

export type DataManager<T extends DataRecord = DataRecord> = {
  list(query?: PageQuery): Promise<PageResult<T>>;
  get(id: ID): Promise<T | undefined>;
  create(patch: Partial<T>): Promise<T | void>;
  update(patch: Partial<T> & RecordId): Promise<T | void>;
  delete(idOrRecord: ID | RecordId | Partial<T>): Promise<void>;
  cancel(item?: Partial<T>): Promise<void>;
  commit?(): Promise<void>;
  discard?(id?: ID): Promise<void>;
  getDraftItems?(): DraftRecord<T>[];
};

export type DataManagementPart<T extends DataRecord = DataRecord> = IDataset &
  DataManager<T> & {
    type: 'data-management';
    store: DataStore<T>;
    redraw(mapId: string): void | Promise<void>;
    addToMap(map: unknown): void | Promise<void>;
  };
