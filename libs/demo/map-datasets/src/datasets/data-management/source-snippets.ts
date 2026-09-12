import {
  createMenuBuilder,
  createMenuClickAddComponentBuilder,
  createMenuClickBuilder,
  LIST_VIEW_MENU_ID,
} from '@hungpvq/map-dataset/menu';
import { mdiCodeTags } from '@mdi/js';

/** Registry component key — register Vue/React viewer in the demo app. */
export const DEMO_DATASET_SOURCE_VIEWER_KEY = 'demo-dataset-source-viewer';

export type DatasetSourceSnippet = {
  /** Matches list `getName()` / factory list name. */
  listName: string;
  title: string;
  /** Copy-ready TypeScript that builds the dataset (no example payload). */
  definition: string;
  /** Example / seed data for a separate tab (JSON). Omit when unavailable. */
  exampleData?: string;
  /**
   * Where Example data is consumed (shown above definition when exampleData is set).
   * Prefer short lines, e.g. `initData → createDataManagement(..., { initData })`.
   */
  exampleDataUsage?: string;
};

/** Prepend EXAMPLE DATA call-site notes when the Example data tab exists. */
export function formatSnippetDefinition(snippet: DatasetSourceSnippet): string {
  if (!snippet.exampleData?.trim()) return snippet.definition;
  const usageLines = (
    snippet.exampleDataUsage?.trim() ||
    'See call sites marked with // ← Example data tab'
  )
    .split('\n')
    .map((line) => ` * ${line}`);
  return [
    '/**',
    ' * EXAMPLE DATA',
    ' * Open the "Example data" tab for the JSON payload used here.',
    ' *',
    ...usageLines,
    ' */',
    '',
    snippet.definition,
  ].join('\n');
}

const SNIPPETS: Record<string, DatasetSourceSnippet> = {
  'GeoJSON features': {
    listName: 'GeoJSON features',
    title: 'Local GeoJSON + data-management',
    exampleDataUsage: `Used as argument \`initData\` of createLocalGeojsonDataset(initData).
Wired into: createDataManagement('records', { store: 'local', ..., initData }).
Call: createLocalGeojsonDataset(/* ← Example data tab */);`,
    definition: `import {
  createRootDataset,
  createDatasetPartListViewUiComponentBuilder,
  createMultiMapboxLayerComponent,
} from '@hungpvq/map-dataset';
import { createDatasetPartAttributeTable } from '@hungpvq/map-dataset/attribute-table';
import { createDataManagement } from '@hungpvq/map-dataset/data-management';
import { createDatasetPartGeojsonSourceComponent } from '@hungpvq/map-dataset/geojson';
import { createDatasetPartIdentifyComponentBuilder } from '@hungpvq/map-dataset/identify';
import { LayerSimpleMapboxBuild } from '@hungpvq/map-dataset/style';
import type { FeatureCollection } from 'geojson';

export function createLocalGeojsonDataset(
  initData: FeatureCollection, // ← Example data tab (FeatureCollection seed)
) {
  const dataset = createRootDataset('Local GeoJSON');
  const list = createDatasetPartListViewUiComponentBuilder(
    'GeoJSON features',
  ).build();
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
  const dataManagement = createDataManagement('records', {
    store: 'local',
    format: 'feature-collection',
    persistKey: 'demo-dm-geojson',
    initData, // ← Example data tab
  });
  const attributeTable = createDatasetPartAttributeTable('table', {
    columns: [
      { key: 'name', label: 'Name (dataset part)' },
      { key: 'id', label: 'ID', sortable: false },
      { key: '__geometry', label: 'Geometry', sortable: false },
    ],
    ui: { sort: true },
  });

  dataset.add(attributeTable);
  dataset.add(identify);
  dataset.add(list);
  dataset.add(source);
  dataset.add(layer);
  dataset.add(dataManagement);
  return dataset;
}

// Usage with Example data tab:
// createLocalGeojsonDataset(/* paste Example data JSON as FeatureCollection */);`,
    exampleData: `{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "1",
      "properties": { "id": "1", "name": "feature 1" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[105.7664, 20.9537], [105.7664, 20.8062], [105.9598, 20.8062], [105.9598, 20.9537], [105.7664, 20.9537]]]
      }
    },
    {
      "type": "Feature",
      "id": "2",
      "properties": { "id": "2", "name": "feature 2" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[105.6019, 20.8828], [105.6019, 20.7094], [105.8544, 20.7094], [105.8544, 20.8828], [105.6019, 20.8828]]]
      }
    }
  ]
}`,
  },

  'List with geom': {
    listName: 'List with geom',
    title: 'Local list + geom field',
    exampleDataUsage: `Used as argument \`initData\` of createLocalListGeomDataset(initData).
Wired into: createDataManagement('records', { store: 'local', format: 'list', ..., initData }).
Call: createLocalListGeomDataset(/* ← Example data tab */);`,
    definition: `import {
  createRootDataset,
  createDatasetPartListViewUiComponentBuilder,
  createMultiMapboxLayerComponent,
} from '@hungpvq/map-dataset';
import { createDataManagement } from '@hungpvq/map-dataset/data-management';
import { createDatasetPartGeojsonSourceComponent } from '@hungpvq/map-dataset/geojson';
import { createDatasetPartIdentifyComponentBuilder } from '@hungpvq/map-dataset/identify';
import { LayerSimpleMapboxBuild } from '@hungpvq/map-dataset/style';

export function createLocalListGeomDataset(
  initData: Array<{
    id: number | string;
    name: string;
    geom: GeoJSON.Geometry;
  }>, // ← Example data tab (list records with geom)
) {
  const dataset = createRootDataset('Local list');
  const list = createDatasetPartListViewUiComponentBuilder(
    'List with geom',
  ).build();
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
  const dataManagement = createDataManagement('records', {
    store: 'local',
    format: 'list',
    persistKey: 'demo-dm-list-geom',
    geometryFields: ['geometry', 'geom', 'geo'],
    initData, // ← Example data tab
  });

  dataset.add(identify);
  dataset.add(list);
  dataset.add(source);
  dataset.add(layer);
  dataset.add(dataManagement);
  return dataset;
}

// Usage with Example data tab:
// createLocalListGeomDataset(/* paste Example data JSON */);`,
    exampleData: `[
  {
    "id": 1,
    "name": "name 1",
    "geom": {
      "type": "Polygon",
      "coordinates": [[[105.85, 21.02], [105.85, 21.0], [105.88, 21.0], [105.88, 21.02], [105.85, 21.02]]]
    }
  },
  {
    "id": 2,
    "name": "name 2",
    "geom": {
      "type": "Point",
      "coordinates": [105.86, 21.01]
    }
  }
]`,
  },

  'HTTP paged list': {
    listName: 'HTTP paged list',
    title: 'HTTP paged list (`{ data, meta }`)',
    exampleDataUsage: `Example data is a sample HTTP list response body (not initData).
Shape expected by the http store: { data: DataRecord[], meta: { total, page, pageSize } }.
Used when the demo \`fetch\` / API returns JSON for list({ page, pageSize }).
Call: createHttpPagedDataset({ baseUrl: '/api/demo-parcels' });`,
    definition: `import {
  createRootDataset,
  createDatasetPartListViewUiComponentBuilder,
  createMultiMapboxLayerComponent,
} from '@hungpvq/map-dataset';
import { createDataManagement } from '@hungpvq/map-dataset/data-management';
import { createDatasetPartGeojsonSourceComponent } from '@hungpvq/map-dataset/geojson';
import { createDatasetPartIdentifyComponentBuilder } from '@hungpvq/map-dataset/identify';
import { LayerSimpleMapboxBuild } from '@hungpvq/map-dataset/style';

/**
 * Expects API list responses shaped as Example data tab:
 * { data: DataRecord[], meta: { total, page, pageSize } }
 * Pass your real \`fetch\` (omit \`http.fetch\` to use global fetch).
 */
export function createHttpPagedDataset(options: {
  baseUrl: string;
  fetch?: typeof fetch; // mock can return Example data JSON
}) {
  const dataset = createRootDataset('HTTP DM');
  const list = createDatasetPartListViewUiComponentBuilder(
    'HTTP paged list',
  ).build();
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
  const dataManagement = createDataManagement('records', {
    store: 'http',
    http: {
      baseUrl: options.baseUrl,
      geometryField: 'geom',
      // list() response body ← Example data tab ({ data, meta })
      ...(options.fetch ? { fetch: options.fetch } : {}),
    },
    syncMap: true,
  });

  dataset.add(identify);
  dataset.add(list);
  dataset.add(source);
  dataset.add(layer);
  dataset.add(dataManagement);
  return dataset;
}

// Usage:
// createHttpPagedDataset({ baseUrl: '/api/demo-parcels', fetch: mockReturningExampleData });`,
    exampleData: `{
  "data": [
    {
      "id": 1,
      "name": "parcel 1",
      "geom": { "type": "Point", "coordinates": [105.8, 21.0] }
    },
    {
      "id": 2,
      "name": "parcel 2",
      "geom": { "type": "Point", "coordinates": [105.82, 21.0] }
    }
  ],
  "meta": { "total": 120, "page": 1, "pageSize": 50 }
}`,
  },

  'HTTP custom parseList': {
    listName: 'HTTP custom parseList',
    title: 'HTTP custom parseList / serializeBody',
    exampleDataUsage: `Example data is a sample legacy API list body (not initData).
Consumed by http.parseList(raw) — maps result.rows → DataRecord[].
Call: createHttpCustomFormatDataset({ baseUrl: '/api/legacy/parcels' });`,
    definition: `import {
  createRootDataset,
  createDatasetPartListViewUiComponentBuilder,
  createMultiMapboxLayerComponent,
} from '@hungpvq/map-dataset';
import {
  createDataManagement,
  type DataRecord,
  type PageResult,
} from '@hungpvq/map-dataset/data-management';
import { createDatasetPartGeojsonSourceComponent } from '@hungpvq/map-dataset/geojson';
import { createDatasetPartIdentifyComponentBuilder } from '@hungpvq/map-dataset/identify';
import { LayerSimpleMapboxBuild } from '@hungpvq/map-dataset/style';

type LegacyApiRow = {
  parcel_id: number | string;
  title: string;
  geo?: { lon: number; lat: number };
};

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
    record.geometry?.type === 'Point'
      ? record.geometry.coordinates
      : undefined;
  return {
    parcel_id: record.id,
    title: String(record.name ?? ''),
    geo:
      coords != null
        ? { lon: Number(coords[0]), lat: Number(coords[1]) }
        : undefined,
  };
}

export function createHttpCustomFormatDataset(options: {
  baseUrl: string;
  fetch?: typeof fetch; // mock can return Example data JSON
}) {
  const dataset = createRootDataset('HTTP custom format');
  const list = createDatasetPartListViewUiComponentBuilder(
    'HTTP custom parseList',
  ).build();
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
  const dataManagement = createDataManagement('records', {
    store: 'http',
    http: {
      baseUrl: options.baseUrl,
      idField: 'parcel_id',
      query: { page: 'page', pageSize: 'size' },
      ...(options.fetch ? { fetch: options.fetch } : {}),
      parseList(raw): PageResult<DataRecord> {
        // \`raw\` ← Example data tab (legacy { success, result: { rows, pagination } })
        const body = raw as {
          result?: {
            rows?: LegacyApiRow[];
            pagination?: { current?: number; perPage?: number; count?: number };
          };
        };
        const rows = body.result?.rows ?? [];
        const pagination = body.result?.pagination;
        return {
          items: rows.map(legacyRowToRecord),
          total: pagination?.count ?? rows.length,
          page: pagination?.current ?? 1,
          pageSize: pagination?.perPage ?? rows.length,
        };
      },
      parseItem(raw): DataRecord {
        const body = raw as { result?: LegacyApiRow };
        return legacyRowToRecord(body.result ?? (raw as LegacyApiRow));
      },
      serializeBody(record) {
        return recordToLegacyRow(record);
      },
    },
    syncMap: true,
  });

  dataset.add(identify);
  dataset.add(list);
  dataset.add(source);
  dataset.add(layer);
  dataset.add(dataManagement);
  return dataset;
}

// Usage:
// createHttpCustomFormatDataset({ baseUrl: '/api/legacy/parcels', fetch: mockReturningExampleData });`,
    exampleData: `{
  "success": true,
  "result": {
    "rows": [
      {
        "parcel_id": "L1",
        "title": "Legacy parcel 1",
        "geo": { "lon": 105.8, "lat": 21.02 }
      },
      {
        "parcel_id": "L2",
        "title": "Legacy parcel 2",
        "geo": { "lon": 105.82, "lat": 21.03 }
      }
    ],
    "pagination": { "current": 1, "perPage": 10, "count": 80 }
  }
}`,
  },

  'Custom DataStore': {
    listName: 'Custom DataStore',
    title: 'Custom in-memory DataStore',
    exampleDataUsage: `Used as argument \`seed\` of createMemoryStoreDataset(seed).
Wired into: createMemoryDataStore(seed) → createDataManagement('records', { store }).
Call: createMemoryStoreDataset(/* ← Example data tab */);`,
    definition: `import {
  createRootDataset,
  createDatasetPartListViewUiComponentBuilder,
  createMultiMapboxLayerComponent,
} from '@hungpvq/map-dataset';
import {
  createDataManagement,
  type DataRecord,
  type DataStore,
  type PageQuery,
  type PageResult,
} from '@hungpvq/map-dataset/data-management';
import { createDatasetPartGeojsonSourceComponent } from '@hungpvq/map-dataset/geojson';
import { createDatasetPartIdentifyComponentBuilder } from '@hungpvq/map-dataset/identify';
import { LayerSimpleMapboxBuild } from '@hungpvq/map-dataset/style';

function createMemoryDataStore(
  seed: DataRecord[], // ← Example data tab
): DataStore {
  let rows = seed.map((r) => ({ ...r }));
  return {
    async list(query: PageQuery = {}): Promise<PageResult<DataRecord>> {
      const page = query.page && query.page > 0 ? query.page : 1;
      const pageSize =
        query.pageSize === 'all'
          ? rows.length || 1
          : Number(query.pageSize) > 0
            ? Number(query.pageSize)
            : 50;
      const start = (page - 1) * pageSize;
      return {
        items: rows.slice(start, start + pageSize),
        total: rows.length,
        page,
        pageSize,
      };
    },
    async get(id) {
      return rows.find((r) => String(r.id) === String(id));
    },
    async create(record) {
      rows.push(record);
      return record;
    },
    async update(id, patch) {
      const idx = rows.findIndex((r) => String(r.id) === String(id));
      if (idx < 0) throw new Error('not found');
      rows[idx] = { ...rows[idx], ...patch, id: rows[idx].id };
      return rows[idx];
    },
    async delete(id) {
      rows = rows.filter((r) => String(r.id) !== String(id));
    },
  };
}

export function createMemoryStoreDataset(
  seed: DataRecord[], // ← Example data tab
) {
  const dataset = createRootDataset('Memory store');
  const list = createDatasetPartListViewUiComponentBuilder(
    'Custom DataStore',
  ).build();
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
  const dataManagement = createDataManagement('records', {
    store: createMemoryDataStore(seed), // ← Example data tab → seed rows
  });

  dataset.add(identify);
  dataset.add(list);
  dataset.add(source);
  dataset.add(layer);
  dataset.add(dataManagement);
  return dataset;
}

// Usage with Example data tab:
// createMemoryStoreDataset(/* paste Example data JSON as DataRecord[] */);`,
    exampleData: `[
  {
    "id": "m1",
    "name": "memory 1",
    "geometry": { "type": "Point", "coordinates": [105.85, 21.05] }
  }
]`,
  },
};

import { getRegisteredViewSourceSnippet } from './view-source-registry';

export function getDatasetSourceSnippet(
  listName: string | undefined,
): DatasetSourceSnippet {
  let snippet: DatasetSourceSnippet | undefined;
  if (listName && SNIPPETS[listName]) {
    snippet = SNIPPETS[listName];
  } else if (listName) {
    snippet = getRegisteredViewSourceSnippet(listName);
  }
  if (snippet) {
    return {
      ...snippet,
      definition: formatSnippetDefinition(snippet),
    };
  }
  const name = listName?.trim() || 'Unknown layer';
  return {
    listName: name,
    title: `Dataset: ${name}`,
    definition: `// No curated definition snippet for "${name}" yet.
// Add an entry via registerFactoryViewSource / source-snippets.ts.
`,
  };
}

/** List ⋮ menu: open copyable definition + example-data tabs. */
export function createMenuItemViewDatasetSource() {
  return createMenuBuilder()
    .item()
    .setId('demo-view-dataset-source')
    .setLocation('menu')
    .setName('View source')
    .setIcon(mdiCodeTags)
    .setClick(
      createMenuClickBuilder()
        .addTupleDynamic(LIST_VIEW_MENU_ID.addComponent, ({ layer }) => {
          const snippet = getDatasetSourceSnippet(layer?.getName?.());
          return {
            value: createMenuClickAddComponentBuilder()
              .setComponentKey(DEMO_DATASET_SOURCE_VIEWER_KEY)
              .setAttr({
                title: snippet.title,
                listName: snippet.listName,
                definition: snippet.definition,
                ...(snippet.exampleData
                  ? { exampleData: snippet.exampleData }
                  : {}),
              })
              .setCheck(`demo-source:${snippet.listName}`)
              .build(),
          };
        })
        .build(),
    )
    .build();
}
