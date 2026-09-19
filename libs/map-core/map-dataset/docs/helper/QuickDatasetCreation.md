# Quick Dataset Creation

One-call helpers that build a root dataset (source + list UI + layer).

For a full Map + LayerControl walkthrough with **inline GeoJSON and no GIS worker**, see [Minimal starter](/map/core/minimal-starter).

```typescript
import { createGeoJsonDataset } from '@hungpvq/map-dataset/geojson';
import { createRasterUrlDataset } from '@hungpvq/map-dataset/raster';

const points = createGeoJsonDataset({
  name: 'Cities',
  geojson: geojsonData,
  type: 'point', // 'point' | 'line' | 'area' | 'symbol'
  color: '#ff6b6b',
});

const raster = createRasterUrlDataset({
  name: 'Tiles',
  tiles: ['https://example.com/tiles/{z}/{x}/{y}.png'],
  bounds: [102.144, 8.179, 109.464, 23.393],
  minzoom: 5,
  maxzoom: 15,
});
```

## `createGeoJsonDataset`

| Option | Type | Required | Role |
| --- | --- | --- | --- |
| `name` | `string` | yes | Root / list / source name |
| `geojson` | GeoJSON | yes | Features |
| `type` | `'point' \| 'line' \| 'area' \| 'symbol'` | yes | Layer style |
| `color` | color | no | List swatch + paint (random if omitted) |
| `opacity` | `number` | no | Fill / line / circle opacity |
| `export` | `boolean` | no | Add list ⋮ Export (default `true`) |
| `attributeTable` | `boolean` | no | Add list ⋮ Attribute table (default `true`) |

Computes bbox from `geojson`, stores it on a **bound** node (`createDatasetPartBoundComponent`), and adds a **Fill bound** extra button on the list row (reads the bound part at click time). Also adds an identify node with zoom-to-bounds and show-detail menus, a per-layer **Identify** extra toggle (scoped IdentifyControl), plus list ⋮ **Export** and **Attribute table** unless you pass `export: false` / `attributeTable: false`. Mount `IdentifyControl` + `ComponentManagementControl` to use identify / those dialogs.

Stamps stable `properties._id` (`ensureGeojsonFeatureIds`) and sets GeoJSON source `promoteId: '_id'` so Identify box-select ↔ AttributeTable row select stay in sync after zoom. Identify `field_id` defaults to `_id` for this helper.

To change the fit target later without rebuilding the menu:

```ts
import { findSiblingOrNearestLeaf } from '@hungpvq/map-dataset';

const bound = findSiblingOrNearestLeaf(
  list,
  (node) => node.type === 'bound',
);
bound?.setData([105.5, 20.5, 106.5, 21.5]);
```

## `createRasterUrlDataset`

| Option | Type | Required | Role |
| --- | --- | --- | --- |
| `name` | `string` | yes | Root name |
| `tiles` | `string[]` | yes | Tile URLs with `{z}/{x}/{y}` |
| `bounds` | `[w, s, e, n]` | no | MapLibre bounds |
| `minzoom` / `maxzoom` | `number` | no | Zoom range |

**Events:** none. Add with `useMapDataset(map.id).addDataset(dataset)`. For a custom tree (menus, groups), use [create-dataset](../create-dataset/).
