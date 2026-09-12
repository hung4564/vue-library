/**
 * Public entry for `@hungpvq/map-dataset/data-management`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export { createDataManagement, isDataManagementView } from './dataset-part';
export { createHttpStore } from './http-store';
export { createLocalStore } from './local-store';
export { createDataManager } from './manager';
export {
  normalizeInitData,
  pickGeometry,
  resolveRecordId,
  toFeature,
  toFeatureCollection,
  toRecord,
} from './normalize';

export type {
  CreateDataManagementOptions,
  DataFormat,
  DataHook,
  DataHookAction,
  DataHookContext,
  DataManagementPart,
  DataManager,
  DataRecord,
  DataStore,
  DraftRecord,
  DraftStatus,
  HttpListResponse,
  HttpStoreOptions,
  HttpStoreQueryKeys,
  ID,
  LocalStoreOptions,
  NormalizeOptions,
  PageQuery,
  PageResult,
  RecordId,
} from './types';
