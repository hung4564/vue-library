import { getUUIDv4 } from '@hungpvq/shared';
import { toRecord } from './normalize';
import type {
  DataRecord,
  DataStore,
  HttpListResponse,
  HttpStoreOptions,
  ID,
  PageQuery,
  PageResult,
  RecordId,
} from './types';

function defaultParseList(json: unknown): HttpListResponse {
  if (!json || typeof json !== 'object') {
    return { data: [], meta: { total: 0, page: 1, pageSize: 1 } };
  }
  const body = json as Record<string, unknown>;
  if (Array.isArray(body['data'])) {
    const meta = (body['meta'] ?? {}) as Record<string, unknown>;
    const data = body['data'] as DataRecord[];
    return {
      data,
      meta: {
        total: Number(meta['total'] ?? data.length),
        page: Number(meta['page'] ?? 1),
        pageSize: Number(meta['pageSize'] ?? meta['limit'] ?? (data.length || 1)),
      },
    };
  }
  if (Array.isArray(body['items'])) {
    const meta = (body['meta'] ?? {}) as Record<string, unknown>;
    const data = body['items'] as DataRecord[];
    return {
      data,
      meta: {
        total: Number(meta['total'] ?? data.length),
        page: Number(meta['page'] ?? 1),
        pageSize: Number(meta['pageSize'] ?? meta['limit'] ?? (data.length || 1)),
      },
    };
  }
  if (Array.isArray(json)) {
    const data = json as DataRecord[];
    return {
      data,
      meta: { total: data.length, page: 1, pageSize: data.length || 1 },
    };
  }
  return { data: [], meta: { total: 0, page: 1, pageSize: 1 } };
}

function joinUrl(baseUrl: string, path = ''): string {
  const base = baseUrl.replace(/\/$/, '');
  if (!path) return base;
  return `${base}/${path.replace(/^\//, '')}`;
}

export function createHttpStore(
  options: HttpStoreOptions,
): DataStore<DataRecord> {
  const {
    baseUrl,
    idField = 'id',
    geometryField,
    geometryFields,
    query: queryKeys = {},
    parseList = defaultParseList,
    parseItem = (json: unknown) => json,
    serializeBody = (record: DataRecord) => record,
    fetch: fetchImpl = globalThis.fetch.bind(globalThis),
  } = options;

  const normalizeOpts = {
    idField,
    geometryFields: geometryFields ??
      (geometryField ? [geometryField, 'geometry', 'geom', 'geo'] : undefined),
  };

  const pageKey = queryKeys.page ?? 'page';
  const pageSizeKey = queryKeys.pageSize ?? 'limit';
  const searchKey = queryKeys.search ?? 'search';

  async function request(
    input: string,
    init?: RequestInit,
  ): Promise<unknown> {
    const res = await fetchImpl(input, {
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      ...init,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${input}`);
    }
    if (res.status === 204) return undefined;
    const text = await res.text();
    if (!text) return undefined;
    return JSON.parse(text) as unknown;
  }

  return {
    async list(query?: PageQuery): Promise<PageResult<DataRecord>> {
      const url = new URL(joinUrl(baseUrl), 'http://local.invalid');
      const isAbsolute = /^https?:\/\//i.test(baseUrl);
      const endpoint = isAbsolute ? new URL(baseUrl) : url;

      if (query?.page != null) {
        endpoint.searchParams.set(pageKey, String(query.page));
      }
      if (query?.pageSize != null && query.pageSize !== 'all') {
        endpoint.searchParams.set(pageSizeKey, String(query.pageSize));
      }
      if (query?.pageSize === 'all') {
        endpoint.searchParams.set(pageSizeKey, '-1');
      }
      if (query?.search) {
        endpoint.searchParams.set(searchKey, query.search);
      }
      if (query?.sort?.field) {
        endpoint.searchParams.set('sort', query.sort.field);
        endpoint.searchParams.set('order', query.sort.dir);
      }
      if (query?.filter) {
        const ids = query.filter['ids'];
        if (Array.isArray(ids)) {
          endpoint.searchParams.set('ids', ids.map(String).join(','));
        } else if (ids != null) {
          endpoint.searchParams.set('ids', String(ids));
        }
        for (const [key, value] of Object.entries(query.filter)) {
          if (key === 'ids' || value == null) continue;
          endpoint.searchParams.set(`filter.${key}`, String(value));
        }
      }
      if (query?.point) {
        endpoint.searchParams.set('lng', String(query.point[0]));
        endpoint.searchParams.set('lat', String(query.point[1]));
      }
      if (query?.bbox) {
        endpoint.searchParams.set('bbox', query.bbox.join(','));
      }

      const href = isAbsolute
        ? endpoint.toString()
        : `${joinUrl(baseUrl)}${endpoint.search}`;
      const json = await request(href);
      const parsed = parseList(json);
      const items = parsed.data
        .map((item) => toRecord(item, normalizeOpts))
        .filter((x): x is DataRecord => !!x);
      return {
        items,
        total: parsed.meta['total'],
        page: parsed.meta['page'],
        pageSize: parsed.meta['pageSize'],
      };
    },

    async get(id: ID) {
      const json = await request(joinUrl(baseUrl, String(id)));
      return toRecord(parseItem(json), normalizeOpts);
    },

    async create(patch: Partial<DataRecord>) {
      const body = toRecord(patch, normalizeOpts) ?? { ...patch };
      if (body.id == null) body.id = getUUIDv4();
      const json = await request(joinUrl(baseUrl), {
        method: 'POST',
        body: JSON.stringify(serializeBody(body)),
      });
      return (
        toRecord(parseItem(json ?? body), normalizeOpts) ??
        (body as DataRecord)
      );
    },

    async update(patch: Partial<DataRecord> & RecordId) {
      const body = toRecord(patch, normalizeOpts) ?? { ...patch };
      const json = await request(joinUrl(baseUrl, String(patch.id)), {
        method: 'PUT',
        body: JSON.stringify(serializeBody(body as DataRecord)),
      });
      return (
        toRecord(parseItem(json ?? body), normalizeOpts) ??
        (body as DataRecord)
      );
    },

    async delete(id: ID) {
      await request(joinUrl(baseUrl, String(id)), { method: 'DELETE' });
    },
  };
}
