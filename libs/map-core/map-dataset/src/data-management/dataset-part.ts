import { getMap, type MapSimple } from '@hungpvq/map-core';
import { createNamedComponent } from '../model/base';
import { createDatasetLeaf } from '../model/dataset.base.function';
import { findSiblingOrNearestLeaf } from '../model/visitors';
import { isDatasetSourceMap } from '../utils/check';
import { createHttpStore } from './http-store';
import { createLocalStore } from './local-store';
import { createDataManager } from './manager';
import { toFeatureCollection } from './normalize';
import type {
  CreateDataManagementOptions,
  DataManagementPart,
  DataRecord,
  DataStore,
  ID,
  PageQuery,
  RecordId,
} from './types';

function resolveStore<T extends DataRecord>(
  options: CreateDataManagementOptions<T>,
): DataStore<T> {
  if (typeof options.store === 'object') {
    return options.store;
  }
  if (options.store === 'http') {
    if (!options.http) {
      throw new Error('createDataManagement: http options required when store is "http"');
    }
    return createHttpStore({
      ...options.http,
      idField: options.http.idField ?? options.idField,
      geometryFields:
        options.http.geometryFields ?? options.geometryFields,
      geometryField: options.http.geometryField,
    }) as DataStore<T>;
  }
  return createLocalStore({
    persistKey: options.persistKey,
    initData: options.initData,
    format: options.format,
    idField: options.idField,
    geometryFields: options.geometryFields,
  }) as DataStore<T>;
}

export function createDataManagement<T extends DataRecord = DataRecord>(
  name: string,
  options: CreateDataManagementOptions<T>,
): DataManagementPart<T> {
  const store = resolveStore(options);
  const manager = createDataManager<T>(store, {
    draft: options.draft,
    hooks: options.hooks,
  });
  const syncMap = options.syncMap !== false;
  const base = createDatasetLeaf(name);

  const part = createNamedComponent('DataManagementComponent', {
    ...base,
    ...manager,
    store,
    get type(): 'data-management' {
      return 'data-management';
    },
    async list(query?: PageQuery) {
      return manager.list(query);
    },
    async get(id: ID) {
      return manager.get(id);
    },
    async create(patch: Partial<T>) {
      return manager.create(patch);
    },
    async update(patch: Partial<T> & RecordId) {
      return manager.update(patch);
    },
    async delete(idOrRecord: ID | RecordId | Partial<T>) {
      return manager.delete(idOrRecord);
    },
    async cancel(item?: Partial<T>) {
      return manager.cancel(item);
    },
    commit: manager.commit?.bind(manager),
    discard: manager.discard?.bind(manager),
    getDraftItems: manager.getDraftItems?.bind(manager),
    async addToMap(map: MapSimple) {
      if (!syncMap) return;
      const { items } = await manager.list({ pageSize: 'all' });
      const source = findSiblingOrNearestLeaf(part, (d) => d.type === 'source');
      if (source && isDatasetSourceMap(source)) {
        source.updateData?.(map, toFeatureCollection(items));
        part.addDependsOn(source);
      }
    },
    redraw(mapId: string) {
      getMap(mapId, (map) => {
        void part.addToMap(map);
      });
    },
  }) as DataManagementPart<T>;

  return part;
}

export function isDataManagementView(
  dataset: unknown,
): dataset is DataManagementPart {
  return (
    !!dataset &&
    typeof dataset === 'object' &&
    (dataset as { type?: string }).type === 'data-management'
  );
}
