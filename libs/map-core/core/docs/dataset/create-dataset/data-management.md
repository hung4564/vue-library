# Data Management

CRUD for dataset records. Prefer the local GeoJSON helper unless you need a custom adapter.

**Events:** none. Call `list` / `create` / `update` / `delete` / `getDetail` / `redraw` on the node.

## Local GeoJSON (localStorage)

```ts
import { createDatasetPartDataManagementGeojsonLocalComponent } from '@hungpvq/vue-map-dataset';

const dataManagement = createDatasetPartDataManagementGeojsonLocalComponent('records', {
  key: 'my-layer-geojson', // localStorage key
  initData: features,      // GeoJSON Feature[]
});

dataset.add(dataManagement);
```

On `addToMap`, features are written to the sibling source (`type === 'source'`). `list({ point: [lng, lat] })` filters by intersection.

## Custom adapter

```ts
createDatasetPartDataManagementComponent(name, {
  source: 'geojson',
  adapter: {
    list: async () => [],
    create: async (item) => item,
    getDetail: async (item) => item,
    update: async (item) => item,
    delete: async () => undefined,
  },
  mapper?: IDataMapper,
  hooks?: IDataManagerHook[],
});
```

| Option | Role |
| --- | --- |
| `source` | Label (e.g. `'geojson'`) |
| `adapter` | `list` / `create` / `getDetail` / `update` / `delete` |
| `mapper` | Feature ↔ record |
| `hooks` | `before*` / `after*` around those actions |

Draft variants (edit then `commit` / `discard`):

- `createDatasetPartDataManagementDraftComponent`
- `createDatasetParDraftDataManagementGeojsonLocalComponent`

Also: `createDatasetPartDataManagementListLocalComponent` for a plain list stored locally.
