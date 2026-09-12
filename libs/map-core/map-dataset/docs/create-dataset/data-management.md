# Data Management

CRUD for dataset records via a **Record** model and pluggable **DataStore** (local or HTTP).

Import the full API from `@hungpvq/map-dataset/data-management`. Root also exports `createDataManagement` and `isDataManagementView` for convenience. Attribute table lives on `@hungpvq/map-dataset/attribute-table`.

**Events:** none. Call `list` / `create` / `update` / `delete` / `get` / `redraw` on the leaf (`type === 'data-management'`).

## Local FeatureCollection

```ts
import { createDataManagement } from '@hungpvq/map-dataset/data-management';

const dataManagement = createDataManagement('records', {
  store: 'local',
  format: 'feature-collection',
  persistKey: 'my-layer-geojson',
  initData: {
    type: 'FeatureCollection',
    features,
  },
});

dataset.add(dataManagement);
```

On `addToMap`, records are written to the sibling source (`type === 'source'`) as a FeatureCollection. `list({ point: [lng, lat] })` filters by intersection (local store).

## Local list (`geometry` / `geom` / `geo`)

```ts
createDataManagement('records', {
  store: 'local',
  format: 'list',
  persistKey: 'users',
  geometryFields: ['geometry', 'geom', 'geo'],
  initData: [
    { id: 1, name: 'A', geom: { type: 'Point', coordinates: [105, 21] } },
  ],
});
```

Geometry field names are normalized to `geometry` on the canonical record.

## HTTP + pagination

```ts
createDataManagement('records', {
  store: 'http',
  http: {
    baseUrl: '/api/parcels',
    geometryField: 'geom',
    query: { page: 'page', pageSize: 'limit' },
    // optional: parseList, serializeBody, fetch
  },
  syncMap: false, // use when the map source is a URL / tiles, not a full dump
});

const page = await dataManagement.list({ page: 1, pageSize: 20 });
// page: { items, total, page, pageSize }

const all = await dataManagement.list({ pageSize: 'all' });
// all.items — full set when the store supports it
```

Default list response shape: `{ data: [], meta: { total, page, pageSize } }`.

### Non-standard API response

When the backend returns a different envelope, map it with `parseList` / `parseItem` / `serializeBody`:

```ts
createDataManagement('records', {
  store: 'http',
  http: {
    baseUrl: '/api/legacy/parcels',
    query: { page: 'page', pageSize: 'size' },
    parseList(json) {
      // e.g. { success, result: { rows, pagination: { current, perPage, count } } }
      const rows = json.result.rows;
      const p = json.result.pagination;
      return {
        data: rows.map((row) => ({
          id: row.parcel_id,
          name: row.title,
          geometry: {
            type: 'Point',
            coordinates: [row.geo.lon, row.geo.lat],
          },
        })),
        meta: { total: p.count, page: p.current, pageSize: p.perPage },
      };
    },
    parseItem(json) {
      // unwrap { success, result: row } from get/create/update
      return json.result;
    },
    serializeBody(record) {
      // canonical record → API write body
      return {
        parcel_id: record.id,
        title: record.name,
        geo: {
          lon: record.geometry.coordinates[0],
          lat: record.geometry.coordinates[1],
        },
      };
    },
  },
});
```

Demo: `/#/dataset-data-management`. Layer ⋮ **View source** is attached on all demo list layers (`attachViewSourceMenuToLists`). Data-management lists use curated copy-ready snippets; other demos register factory source via `view-source-catalog` / highlight self-registration. Attribute table UI: [Attribute table](./attribute-table.md) (`/#/dataset-attribute-table`).


For large APIs prefer `syncMap: false` and keep map data on a separate source; use `list` for tables/forms.

## Custom store

```ts
createDataManagement('records', {
  store: myDataStore, // implements list/get/create/update/delete
});
```

## Draft mode

```ts
createDataManagement('records', {
  store: 'local',
  draft: true,
  persistKey: 'draft-layer',
});

await dataManagement.create(patch); // buffered
await dataManagement.commit?.();
await dataManagement.discard?.();
```

## Hooks

```ts
createDataManagement('records', {
  store: 'local',
  hooks: {
    beforeCreate(ctx) {
      // return { cancel: true } to abort
      // or return a partial patch to merge into payload
    },
    afterCreate(ctx) {},
    beforeDraftCommit(ctx) {},
  },
});
```

## Map sync

| Option | Behavior |
| --- | --- |
| `syncMap: true` (default) | `addToMap` / `redraw` push `list({ pageSize: 'all' }).items` into the sibling GeoJSON source |
| `syncMap: false` | CRUD only; map source managed elsewhere |

Export and Attribute table resolve data via `list({ pageSize: 'all' })` when a `data-management` sibling exists.
