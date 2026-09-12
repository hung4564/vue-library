import booleanIntersects from '@turf/boolean-intersects';
import { point as pointTurf } from '@turf/helpers';
import { getUUIDv4 } from '@hungpvq/shared';
import { normalizeInitData, toFeatureCollection, toRecord } from './normalize';
import type {
  DataFormat,
  DataRecord,
  DataStore,
  ID,
  LocalStoreOptions,
  PageQuery,
  PageResult,
  RecordId,
} from './types';

function bboxToPolygon(bbox: [number, number, number, number]) {
  const [minX, minY, maxX, maxY] = bbox;
  return {
    type: 'Polygon' as const,
    coordinates: [
      [
        [minX, minY],
        [maxX, minY],
        [maxX, maxY],
        [minX, maxY],
        [minX, minY],
      ],
    ],
  };
}

function getStorage(): Storage | null {
  try {
    const storage = (globalThis as { localStorage?: Storage }).localStorage;
    if (storage) return storage;
  } catch {
    return null;
  }
  return null;
}

function applySearch(items: DataRecord[], search?: string): DataRecord[] {
  if (!search) return items;
  const q = search.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) =>
    Object.entries(item).some(([key, value]) => {
      if (key === 'geometry' || value == null) return false;
      return String(value).toLowerCase().includes(q);
    }),
  );
}

function applyPointFilter(
  items: DataRecord[],
  point?: [number, number],
): DataRecord[] {
  if (!point) return items;
  const pt = pointTurf(point);
  return items.filter((item) => {
    if (!item.geometry) return false;
    try {
      return booleanIntersects(item.geometry as never, pt as never);
    } catch {
      return false;
    }
  });
}

function applyBboxFilter(
  items: DataRecord[],
  bbox?: [number, number, number, number],
): DataRecord[] {
  if (!bbox) return items;
  const poly = bboxToPolygon(bbox);
  return items.filter((item) => {
    if (!item.geometry) return false;
    try {
      return booleanIntersects(item.geometry as never, poly as never);
    } catch {
      return false;
    }
  });
}

/** Attribute Table select convention: `filter.ids` → keep matching records. */
function applyIdsFilter(
  items: DataRecord[],
  filter?: Record<string, unknown>,
): DataRecord[] {
  const raw = filter?.ids;
  if (raw == null) return items;
  const ids = (Array.isArray(raw) ? raw : [raw]).map(String);
  if (!ids.length) return items;
  const requested = new Set(ids);
  return items.filter((item) => item.id != null && requested.has(String(item.id)));
}

function applySort(
  items: DataRecord[],
  sort?: PageQuery['sort'],
): DataRecord[] {
  if (!sort?.field) return items;
  const { field, dir } = sort;
  const mul = dir === 'desc' ? -1 : 1;
  return [...items].sort((a, b) => {
    const av = readRecordField(a, field);
    const bv = readRecordField(b, field);
    if (av == null && bv == null) return 0;
    if (av == null) return -1 * mul;
    if (bv == null) return 1 * mul;
    const an = Number(av);
    const bn = Number(bv);
    if (Number.isFinite(an) && Number.isFinite(bn) && av !== '' && bv !== '') {
      return (an - bn) * mul;
    }
    return (
      String(av).localeCompare(String(bv), undefined, {
        numeric: true,
        sensitivity: 'base',
      }) * mul
    );
  });
}

function readRecordField(item: DataRecord, field: string): unknown {
  if (Object.prototype.hasOwnProperty.call(item, field)) return item[field];
  const props = item.properties;
  if (props && typeof props === 'object' && !Array.isArray(props)) {
    return (props as Record<string, unknown>)[field];
  }
  return undefined;
}

function paginate(
  items: DataRecord[],
  query?: PageQuery,
): PageResult<DataRecord> {
  const total = items.length;
  if (query?.pageSize === 'all' || query?.pageSize == null && query?.page == null) {
    const pageSize = total || 1;
    return { items, total, page: 1, pageSize };
  }
  if (query?.pageSize === -1 as unknown as number) {
    return { items, total, page: 1, pageSize: total || 1 };
  }
  const pageSize =
    typeof query?.pageSize === 'number' && query.pageSize > 0
      ? query.pageSize
      : total || 1;
  const page = query?.page && query.page > 0 ? query.page : 1;
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
  };
}

export function createLocalStore(
  options: LocalStoreOptions = {},
): DataStore<DataRecord> {
  const {
    persistKey,
    initData,
    format = 'auto' as DataFormat,
    idField = 'id',
    geometryFields,
  } = options;
  const normalizeOpts = { idField, geometryFields, format };
  let cache: DataRecord[] | null = null;

  function load(): DataRecord[] {
    if (cache) return cache;
    const storage = getStorage();
    if (persistKey && storage) {
      const raw = storage.getItem(persistKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as unknown;
          cache = normalizeInitData(parsed, normalizeOpts);
          return cache;
        } catch {
          cache = [];
          return cache;
        }
      }
    }
    cache = normalizeInitData(initData, normalizeOpts);
    if (persistKey && storage) save(cache);
    return cache;
  }

  function save(data: DataRecord[]) {
    cache = data;
    const storage = getStorage();
    if (!persistKey || !storage) return;
    if (format === 'feature-collection') {
      storage.setItem(persistKey, JSON.stringify(toFeatureCollection(data)));
    } else if (
      format === 'auto' &&
      initData &&
      typeof initData === 'object' &&
      (initData as { type?: string }).type === 'FeatureCollection'
    ) {
      storage.setItem(persistKey, JSON.stringify(toFeatureCollection(data)));
    } else {
      storage.setItem(persistKey, JSON.stringify(data));
    }
  }

  return {
    async list(query?: PageQuery): Promise<PageResult<DataRecord>> {
      let items = load();
      items = applySearch(items, query?.search);
      items = applyIdsFilter(items, query?.filter);
      items = applyPointFilter(items, query?.point);
      items = applyBboxFilter(items, query?.bbox);
      items = applySort(items, query?.sort);
      if (query?.pageSize === 'all') {
        return {
          items,
          total: items.length,
          page: 1,
          pageSize: items.length || 1,
        };
      }
      return paginate(items, query);
    },

    async get(id: ID) {
      return load().find((item) => item.id == id);
    },

    async create(patch: Partial<DataRecord>) {
      const data = load();
      const record = toRecord(patch, normalizeOpts) ?? { ...patch };
      if (record.id == null) record.id = getUUIDv4();
      data.push(record);
      save(data);
      return record;
    },

    async update(patch: Partial<DataRecord> & RecordId) {
      const data = load();
      const idx = data.findIndex((item) => item.id == patch.id);
      if (idx === -1) {
        throw new Error(`Record with id ${String(patch.id)} not found`);
      }
      const next = {
        ...data[idx],
        ...(toRecord(patch, normalizeOpts) ?? patch),
        id: patch.id,
      };
      data[idx] = next;
      save(data);
      return next;
    },

    async delete(id: ID) {
      const data = load().filter((item) => item.id != id);
      save(data);
    },
  };
}
