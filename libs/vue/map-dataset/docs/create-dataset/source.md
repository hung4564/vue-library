# Source

Data source for MapLibre layers. Put the source node **before** the layer node on the same parent (or set `layer.dependsOn`).

**Events:** none.

## GeoJSON

```ts
import { createDatasetPartGeojsonSourceComponent } from '@hungpvq/vue-map-dataset';

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

List ⋮ **Export** downloads this source as GeoJSON / KML / CSV / Shapefile. See [Export](./export.md).

## Raster tiles

```ts
import { createDatasetPartRasterSourceComponent } from '@hungpvq/vue-map-dataset';

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

```ts
import { createDatasetPartVectorTileComponent } from '@hungpvq/vue-map-dataset';

const vector = createDatasetPartVectorTileComponent('vector-source', {
  tiles: ['https://example.com/tiles/{z}/{x}/{y}.pbf'],
  minzoom: 0,
  maxzoom: 14,
});
```

Second argument is a partial `VectorSourceSpecification` (`type: 'vector'` is set for you).

## With a layer

```ts
const layer = createMultiMapboxLayerComponent('layer', [
  new LayerSimpleMapboxBuild().setStyleType('point').setColor('#ff6b6b').build(),
]);
layer.addDependsOn(source);
dataset.add(source);
dataset.add(layer);
```
