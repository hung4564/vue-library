# Quick Dataset Creation

One-call helpers that build a root dataset (source + list UI + layer).

```typescript
import { createGeoJsonDataset, createRasterUrlDataset } from '@hungpvq/vue-map-dataset';

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

Computes bbox from `geojson`, stores it on a metadata node, and adds a **Fill bound** extra button on the list row. Also adds an identify node with zoom-to-bounds and show-detail menus. Mount `IdentifyControl` + `ComponentManagementControl` to use identify.

## `createRasterUrlDataset`

| Option | Type | Required | Role |
| --- | --- | --- | --- |
| `name` | `string` | yes | Root name |
| `tiles` | `string[]` | yes | Tile URLs with `{z}/{x}/{y}` |
| `bounds` | `[w, s, e, n]` | no | MapLibre bounds |
| `minzoom` / `maxzoom` | `number` | no | Zoom range |

**Events:** none. Add with `useMapDataset(map.id).addDataset(dataset)`. For a custom tree (menus, groups), use [create-dataset](../create-dataset/).
