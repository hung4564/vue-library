import {
  createDataManagement,
  type DataManagementPart,
  type DataRecord,
  type DataStore,
  type PageQuery,
  type PageResult,
} from '@hungpvq/map-dataset/data-management';
import { createDatasetPartGeojsonSourceComponent } from '@hungpvq/map-dataset/geojson';
import {
  createDatasetPartListViewUiComponentBuilder,
  createMultiMapboxLayerComponent,
  createRootDataset,
  findFirstLeafByType,
  type IDataset,
} from '@hungpvq/map-dataset';
import { createDatasetPartAttributeTable } from '@hungpvq/map-dataset/attribute-table';
import { createDatasetPartIdentifyComponentBuilder } from '@hungpvq/map-dataset/identify';
import { LayerSimpleMapboxBuild } from '@hungpvq/map-dataset/style';

export type { DataManagementPart } from '@hungpvq/map-dataset/data-management';
export { attributeTableDemoLogger } from './attribute-table-logger';
export { attachViewSourceMenuToLists } from './attach-view-source';
export {
  createMenuItemViewDatasetSource,
  DEMO_DATASET_SOURCE_VIEWER_KEY,
  getDatasetSourceSnippet,
  type DatasetSourceSnippet,
} from './source-snippets';
export {
  listRegisteredViewSourceNames,
  registerFactoryViewSource,
  registerViewSourceSnippet,
} from './view-source-registry';

// Register factory-backed snippets for all non-DM demos.
import './view-source-catalog';

/** Root dataset name used by the HTTP pager in Vue/React demos. */
export const DATA_MANAGEMENT_HTTP_DATASET_NAME = 'HTTP DM';
export const DATA_MANAGEMENT_HTTP_LIST_NAME = 'HTTP paged list';
export const DATA_MANAGEMENT_HTTP_CUSTOM_LIST_NAME = 'HTTP custom parseList';
export const DATA_MANAGEMENT_LOCAL_GEOJSON_LIST_NAME = 'GeoJSON features';
export const DATA_MANAGEMENT_LOCAL_LIST_NAME = 'List with geom';
export const DATA_MANAGEMENT_MEMORY_LIST_NAME = 'Custom DataStore';

const SAMPLE_POLYGONS = [
  {
    id: '1',
    name: 'feature 1',
    geometry: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [105.76641783359327, 20.95368549262608],
          [105.76641783359327, 20.8061675909956],
          [105.95982873776939, 20.8061675909956],
          [105.95982873776939, 20.95368549262608],
          [105.76641783359327, 20.95368549262608],
        ],
      ],
    },
  },
  {
    id: '2',
    name: 'feature 2',
    geometry: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [105.6018867927948, 20.882848913115083],
          [105.6018867927948, 20.709350165412573],
          [105.85443227815665, 20.709350165412573],
          [105.85443227815665, 20.882848913115083],
          [105.6018867927948, 20.882848913115083],
        ],
      ],
    },
  },
];

function attachIdentifyAndLayers(datasetName: string, listName: string) {
  const dataset = createRootDataset(datasetName);
  const list = createDatasetPartListViewUiComponentBuilder(listName).build();
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [],
  });
  const layer = createMultiMapboxLayerComponent('layer area', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list.color)
      .setOpacity(0.5)
      .build(),
  ]);
  const identify = createDatasetPartIdentifyComponentBuilder(list.getName())
    .setConfigFields([
      { text: 'Id', value: 'id' },
      { text: 'Name', value: 'name' },
    ])
    .configFieldName('id')
    .build();
  return { dataset, list, source, layer, identify };
}

function assemble(
  parts: ReturnType<typeof attachIdentifyAndLayers>,
  dataManagement: DataManagementPart,
) {
  const { dataset, list, source, layer, identify } = parts;
  dataset.add(identify);
  dataset.add(list);
  dataset.add(source);
  dataset.add(layer);
  dataset.add(dataManagement);
  return dataset;
}

export function findDataManagementPart(
  root: IDataset,
): DataManagementPart | undefined {
  return findFirstLeafByType<DataManagementPart>(root, 'data-management');
}

export function findListViewByName(
  roots: IDataset[],
  listName: string,
): IDataset | undefined {
  for (const root of roots) {
    const list = findFirstLeafByType(root, 'list');
    if (list?.getName?.() === listName) return list;
  }
  return undefined;
}

/** Local FeatureCollection + localStorage. */
export function createDataManagementGeojsonListDataset() {
  const parts = attachIdentifyAndLayers('Local GeoJSON', 'GeoJSON features');
  parts.dataset.add(
    createDatasetPartAttributeTable('table', {
      columns: [
        { key: 'name', label: 'Name (dataset part)' },
        { key: 'id', label: 'ID', sortable: false },
        { key: '__geometry', label: 'Geometry', sortable: false },
      ],
      ui: { sort: true },
    }),
  );
  return assemble(
    parts,
    createDataManagement('records', {
      store: 'local',
      format: 'feature-collection',
      persistKey: 'demo-dm-geojson',
      initData: {
        type: 'FeatureCollection',
        features: SAMPLE_POLYGONS.map((row) => ({
          type: 'Feature' as const,
          id: row.id,
          properties: { id: row.id, name: row.name },
          geometry: row.geometry,
        })),
      },
    }),
  );
}

/** Local list rows with `geom` field (normalized to geometry). */
export function createDataManagementListItemDataset() {
  const parts = attachIdentifyAndLayers('Local list', 'List with geom');
  return assemble(
    parts,
    createDataManagement('records', {
      store: 'local',
      format: 'list',
      persistKey: 'demo-dm-list-geom',
      geometryFields: ['geometry', 'geom', 'geo'],
      initData: [
        {
          id: 1,
          name: 'name 1',
          geom: {
            type: 'Polygon',
            coordinates: [
              [
                [106.36703216122214, 21.339114575625146],
                [106.36703216122214, 21.258074000185104],
                [106.49668551611245, 21.258074000185104],
                [106.49668551611245, 21.339114575625146],
                [106.36703216122214, 21.339114575625146],
              ],
            ],
          },
        },
      ],
    }),
  );
}

function createMockHttpFetch(seed: DataRecord[]) {
  let rows = seed.map((r) => ({ ...r }));
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), 'http://demo.local');
    const method = (init?.method ?? 'GET').toUpperCase();
    const parts = url.pathname.split('/').filter(Boolean);
    const id = parts.length > 2 ? parts[parts.length - 1] : undefined;

    if (method === 'GET' && !id) {
      const page = Number(url.searchParams.get('page') ?? 1);
      const limitRaw = Number(url.searchParams.get('limit') ?? 10);
      const limit = limitRaw < 0 ? rows.length || 1 : limitRaw;
      const sortField = url.searchParams.get('sort');
      const order = url.searchParams.get('order') === 'desc' ? -1 : 1;
      let list = [...rows];
      if (sortField) {
        list.sort((a, b) => {
          const av = a[sortField];
          const bv = b[sortField];
          if (av == null && bv == null) return 0;
          if (av == null) return -1 * order;
          if (bv == null) return 1 * order;
          const an = Number(av);
          const bn = Number(bv);
          if (Number.isFinite(an) && Number.isFinite(bn)) {
            return (an - bn) * order;
          }
          return String(av).localeCompare(String(bv), undefined, {
            numeric: true,
            sensitivity: 'base',
          }) * order;
        });
      }
      const start = limitRaw < 0 ? 0 : (page - 1) * limit;
      const data = limitRaw < 0 ? list : list.slice(start, start + limit);
      return new Response(
        JSON.stringify({
          data,
          meta: {
            total: list.length,
            page: limitRaw < 0 ? 1 : page,
            pageSize: limit,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }
    if (method === 'GET' && id) {
      const found = rows.find((r) => String(r.id) === id);
      return new Response(JSON.stringify(found ?? null), {
        status: found ? 200 : 404,
      });
    }
    if (method === 'POST') {
      const body = JSON.parse(String(init?.body ?? '{}')) as DataRecord;
      if (body.id == null) body.id = `h-${rows.length + 1}`;
      rows.push(body);
      return new Response(JSON.stringify(body), { status: 200 });
    }
    if ((method === 'PUT' || method === 'PATCH') && id) {
      const body = JSON.parse(String(init?.body ?? '{}')) as DataRecord;
      const idx = rows.findIndex((r) => String(r.id) === id);
      if (idx >= 0) rows[idx] = { ...rows[idx], ...body, id: rows[idx].id };
      return new Response(JSON.stringify(rows[idx]), { status: 200 });
    }
    if (method === 'DELETE' && id) {
      rows = rows.filter((r) => String(r.id) !== id);
      return new Response(null, { status: 204 });
    }
    return new Response('not found', { status: 404 });
  };
}

/** HTTP store with mock fetch + pagination (`PageResult`). */
export function createDataManagementHttpDataset() {
  const parts = attachIdentifyAndLayers(
    DATA_MANAGEMENT_HTTP_DATASET_NAME,
    'HTTP paged list',
  );
  const seed: DataRecord[] = Array.from({ length: 120 }, (_, i) => ({
    id: i + 1,
    name: `parcel ${i + 1}`,
    geom: {
      type: 'Point',
      coordinates: [105.8 + (i % 10) * 0.02, 21.0 + Math.floor(i / 10) * 0.02],
    },
  }));
  return assemble(
    parts,
    createDataManagement('records', {
      store: 'http',
      http: {
        baseUrl: '/api/demo-parcels',
        geometryField: 'geom',
        fetch: createMockHttpFetch(seed) as unknown as typeof fetch,
      },
      syncMap: true,
    }),
  );
}

/**
 * Legacy / third-party API shape (not `{ data, meta }`):
 * ```json
 * {
 *   "success": true,
 *   "result": {
 *     "rows": [{ "parcel_id": 1, "title": "...", "geo": { "lon": 105.8, "lat": 21 } }],
 *     "pagination": { "current": 1, "perPage": 10, "count": 25 }
 *   }
 * }
 * ```
 * `parseList` + `serializeBody` + `idField` map it to the store contract.
 */
export const DATA_MANAGEMENT_HTTP_CUSTOM_DATASET_NAME = 'HTTP custom format';

type LegacyApiRow = {
  parcel_id: number | string;
  title: string;
  geo?: { lon: number; lat: number };
};

function createMockLegacyHttpFetch(
  seed: LegacyApiRow[],
  basePath = '/api/legacy/parcels',
) {
  let rows: LegacyApiRow[] = seed.map((r) => ({
    ...r,
    geo: r.geo ? { ...r.geo } : undefined,
  }));
  const normalizedBase = basePath.replace(/\/$/, '');

  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), 'http://demo.local');
    const method = (init?.method ?? 'GET').toUpperCase();
    const path = url.pathname.replace(/\/$/, '') || '/';
    const isCollection = path === normalizedBase;
    const id = path.startsWith(`${normalizedBase}/`)
      ? path.slice(normalizedBase.length + 1)
      : undefined;

    if (method === 'GET' && isCollection) {
      // Query uses page + size (mapped via http.query); body is still legacy-shaped.
      const page = Number(url.searchParams.get('page') ?? 1);
      const sizeRaw = Number(url.searchParams.get('size') ?? 10);
      const sizeAll = sizeRaw < 0;
      const size = sizeAll ? rows.length || 1 : sizeRaw;
      const start = sizeAll ? 0 : (page - 1) * size;
      const slice = sizeAll ? rows : rows.slice(start, start + size);
      return new Response(
        JSON.stringify({
          success: true,
          result: {
            rows: slice,
            pagination: {
              current: sizeAll ? 1 : page,
              perPage: size,
              count: rows.length,
            },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }
    if (method === 'GET' && id) {
      const found = rows.find((r) => String(r.parcel_id) === id);
      return new Response(
        JSON.stringify(
          found
            ? { success: true, result: found }
            : { success: false, error: 'not found' },
        ),
        { status: found ? 200 : 404 },
      );
    }
    if (method === 'POST' && isCollection) {
      const body = JSON.parse(String(init?.body ?? '{}')) as LegacyApiRow;
      if (body.parcel_id == null) body.parcel_id = `L${rows.length + 1}`;
      rows.push(body);
      return new Response(JSON.stringify({ success: true, result: body }), {
        status: 200,
      });
    }
    if ((method === 'PUT' || method === 'PATCH') && id) {
      const body = JSON.parse(String(init?.body ?? '{}')) as LegacyApiRow;
      const idx = rows.findIndex((r) => String(r.parcel_id) === id);
      if (idx >= 0) {
        rows[idx] = { ...rows[idx], ...body, parcel_id: rows[idx].parcel_id };
      }
      return new Response(
        JSON.stringify({ success: true, result: rows[idx] }),
        { status: 200 },
      );
    }
    if (method === 'DELETE' && id) {
      rows = rows.filter((r) => String(r.parcel_id) !== id);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
    return new Response(JSON.stringify({ success: false }), { status: 404 });
  };
}

function legacyRowToRecord(row: LegacyApiRow): DataRecord {
  return {
    id: row.parcel_id,
    name: row.title,
    geometry:
      row.geo != null
        ? { type: 'Point', coordinates: [row.geo.lon, row.geo.lat] }
        : null,
  };
}

function recordToLegacyRow(record: DataRecord): LegacyApiRow {
  const coords =
    record.geometry &&
    typeof record.geometry === 'object' &&
    'coordinates' in record.geometry
      ? (record.geometry as { coordinates?: number[] }).coordinates
      : undefined;
  return {
    parcel_id: (record.id as number | string) ?? '',
    title: String(record.name ?? ''),
    geo:
      coords && coords.length >= 2
        ? { lon: coords[0], lat: coords[1] }
        : undefined,
  };
}

function unwrapLegacyItem(json: unknown): unknown {
  if (!json || typeof json !== 'object') return json;
  const body = json as { success?: boolean; result?: unknown };
  if ('result' in body) return body.result;
  return json;
}

export function createDataManagementHttpCustomFormatDataset() {
  const parts = attachIdentifyAndLayers(
    DATA_MANAGEMENT_HTTP_CUSTOM_DATASET_NAME,
    'HTTP custom parseList',
  );
  const seed: LegacyApiRow[] = Array.from({ length: 80 }, (_, i) => ({
    parcel_id: `L${i + 1}`,
    title: `legacy parcel ${i + 1}`,
    geo: {
      lon: 105.75 + (i % 8) * 0.015,
      lat: 20.95 + Math.floor(i / 8) * 0.015,
    },
  }));

  return assemble(
    parts,
    createDataManagement('records', {
      store: 'http',
      http: {
        baseUrl: '/api/legacy/parcels',
        query: { page: 'page', pageSize: 'size' },
        fetch: createMockLegacyHttpFetch(
          seed,
          '/api/legacy/parcels',
        ) as unknown as typeof fetch,
        parseList(json) {
          const body = json as {
            success?: boolean;
            result?: {
              rows?: LegacyApiRow[];
              pagination?: {
                current?: number;
                perPage?: number;
                count?: number;
              };
            };
          };
          const rows = body.result?.rows ?? [];
          const pagination = body.result?.pagination ?? {};
          return {
            // Already canonical records — store will run toRecord again (idempotent).
            data: rows.map(legacyRowToRecord),
            meta: {
              total: Number(pagination.count ?? rows.length),
              page: Number(pagination.current ?? 1),
              pageSize: Number(
                pagination.perPage ?? (rows.length || 1),
              ),
            },
          };
        },
        parseItem(json) {
          const row = unwrapLegacyItem(json) as LegacyApiRow | undefined;
          if (!row || typeof row !== 'object') return undefined;
          return legacyRowToRecord(row);
        },
        serializeBody(record) {
          return recordToLegacyRow(record);
        },
      },
      syncMap: true,
    }),
  );
}

/** Custom in-memory `DataStore` (not localStorage / HTTP). */
export function createMemoryDataStore(
  seed: DataRecord[] = [],
): DataStore<DataRecord> {
  let rows = [...seed];
  return {
    async list(query?: PageQuery): Promise<PageResult<DataRecord>> {
      const pageSize =
        query?.pageSize === 'all' || query?.pageSize == null
          ? rows.length || 1
          : Number(query.pageSize);
      const page = query?.page && query.page > 0 ? query.page : 1;
      const start = (page - 1) * pageSize;
      return {
        items: rows.slice(start, start + pageSize),
        total: rows.length,
        page,
        pageSize,
      };
    },
    async get(id) {
      return rows.find((r) => r.id == id);
    },
    async create(patch) {
      const row = { ...patch, id: patch.id ?? `m-${rows.length + 1}` };
      rows.push(row as DataRecord);
      return row as DataRecord;
    },
    async update(patch) {
      const idx = rows.findIndex((r) => r.id == patch.id);
      if (idx < 0) throw new Error('not found');
      rows[idx] = { ...rows[idx], ...patch };
      return rows[idx];
    },
    async delete(id) {
      rows = rows.filter((r) => r.id != id);
    },
  };
}

export function createDataManagementMemoryStoreDataset() {
  const parts = attachIdentifyAndLayers(
    'Memory store',
    DATA_MANAGEMENT_MEMORY_LIST_NAME,
  );
  return assemble(
    parts,
    createDataManagement('records', {
      store: createMemoryDataStore([
        {
          id: 'm1',
          name: 'memory 1',
          geometry: {
            type: 'Point',
            coordinates: [105.85, 21.05],
          },
        },
      ]),
    }),
  );
}

/** Shared demo set for Vue + React `/#/dataset-data-management` and `/#/dataset-attribute-table`. */
export const DATA_MANAGEMENT_DEMO_DATASET_FACTORIES = [
  createDataManagementGeojsonListDataset,
  createDataManagementListItemDataset,
  createDataManagementHttpDataset,
  createDataManagementHttpCustomFormatDataset,
  createDataManagementMemoryStoreDataset,
] as const;
