# Source

Data source for MapLibre layers. Put the source node **before** the layer node on the same parent (or set `layer.dependsOn`).

**Events:** none.

## GeoJSON

```ts
import { createDatasetPartGeojsonSourceComponent } from '@hungpvq/map-dataset/geojson';

const source = createDatasetPartGeojsonSourceComponent(
  'my-source',
  {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { id: 1, name: 'Hanoi' },
        geometry: { type: 'Point', coordinates: [105.8342, 21.0285] },
      },
    ],
  },
  { generateId: true }, // optional: promoteId | generateId
);
```

| Argument | Type | Role |
| --- | --- | --- |
| `name` | `string` | Source id on the map |
| `data` | GeoJSON / URL | `GeoJSONSourceSpecification['data']` |
| `options.promoteId` | `string` | Feature id from a property |
| `options.generateId` | `boolean` | Let MapLibre generate ids |

After add: `source.updateData(map, nextGeoJSON)` to replace features.

**`createGeoJsonDataset`:** stamps every feature with `properties._id` (`GEOJSON_FEATURE_ID_KEY` / `ensureGeojsonFeatureIds`) when no id exists, and sets source `promoteId: '_id'` so MapLibre `feature.id` matches Identify ↔ AttributeTable after zoom. Prefer this over `generateId` when you need table select / highlight sync. Manual sources should pass `promoteId: '_id'` (or your business id field) the same way.

When the list has **Export** / **Attribute table** menus (opt-in via `addMenu`, or from `createGeoJsonDataset`), Export downloads this source as GeoJSON / KML / CSV / Shapefile and Attribute table lists feature properties. See [Export](./export.md) and [Attribute table](./attribute-table.md).

## Raster tiles

```ts
import { createDatasetPartRasterSourceComponent } from '@hungpvq/map-dataset/raster';

const raster = createDatasetPartRasterSourceComponent('raster-source', {
  type: 'raster',
  tiles: ['https://example.com/tiles/{z}/{x}/{y}.png'],
  tileSize: 256,
  minzoom: 0,
  maxzoom: 18,
  bounds: [102.144, 8.179, 109.464, 23.393],
});
```

Second argument is a MapLibre `RasterSourceSpecification`.

## Vector tiles

### Source part

```ts
import { createDatasetPartVectorTileComponent } from '@hungpvq/map-dataset/vector-tile';

const vector = createDatasetPartVectorTileComponent('vector-source', {
  tiles: ['https://example.com/tiles/{z}/{x}/{y}.pbf'],
  minzoom: 0,
  maxzoom: 14,
});
```

Second argument is a partial `VectorSourceSpecification` (`type: 'vector'` is set for you).

### Dataset builder

```ts
import { createVectorTileDataset } from '@hungpvq/map-dataset/vector-tile';

const dataset = createVectorTileDataset({
  name: 'Countries',
  tiles: ['https://example.com/tiles/{z}/{x}/{y}.pbf'],
  sourceLayer: 'countries',
  styleType: 'area',
  minzoom: 0,
  maxzoom: 14,
});
```

For MBTiles / PMTiles opened via CreateControl, `tiles` uses **`mbtilesLocalTilesUrl(id)`** → `mbtiles-local://…` or **`pmtilesLocalTilesUrl(id)`** → `pmtiles-local://…` after `openMbtilesArchive` / `openPmtilesUrl` / `openPmtilesFile` (worker id `vectortile` + `ensureVectorTileProtocols` → MapLibre `addProtocol`). **Open prefers the vector-tile worker**; main-thread fallback when the worker cannot start. Protocol `get-tile` uses the in-process registry when present, otherwise RPCs to the worker. Vector archives: **one source-layer** → flat list; **two or more** → one parent GroupSubList (master checkbox) with each selected `source-layer` as a SubList. Raster archives use `createRasterUrlDataset` with the same protocol URL.

For **TileJSON** (`LAYER_TYPES.tilejson` / `ConfigTilejsonHelper`), CreateControl fetches the document URL (`loadCreateControlTileJsonFromUrl`), resolves relative `tiles[]` templates (keeps `{z}/{x}/{y}`), and creates via `createVectorTileDataset` with those HTTP(S) templates (no archive protocol). Sample list: `TILEJSON_SAMPLES` — [MapLibre demotiles tiles.json](https://demotiles.maplibre.org/tiles/tiles.json).

For **FileGDB** (`LAYER_TYPES.filegdb` / `ConfigFilegdbHelper`), CreateControl accepts a `.gdb.zip` / `*_gdb.zip` or a `.gdb` folder (optional peer `gdal3.js`), drops non-spatial tables, converts each drawable feature class to GeoJSON, then creates via `createGeoJsonLayersDataset` (MBTiles-like GroupSubList; source-layer checkboxes with feature count / geometry / fields chips; no style/color UI; always auto paint + per-class chart colors; parent/child fill bound). Helpers: `summarizeFileGdbLayerMeta`, `createControlGeojsonPreviewPatch(..., layers)`.

## With a layer

```ts
const layer = createMultiMapboxLayerComponent('layer', [
  new LayerSimpleMapboxBuild().setStyleType('point').setColor('#ff6b6b').build(),
]);
layer.addDependsOn(source);
dataset.add(source);
dataset.add(layer);
```
