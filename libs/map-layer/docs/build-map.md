# Map

## Source

### Raster

#### Use

```ts
import { RasterSourceBuild } from '@hungpvq/vue-map-layer';
new RasterSourceBuild().setTiles(tiles).setBounds(bounds),
```

#### Method

| State       | Props        | Type       | Description |
| ----------- | ------------ | ---------- | ----------- |
| setTiles    | string[]     | `function` |             |
| setMaxzoom  | number       | `function` |             |
| setMinzoom  | number       | `function` |             |
| setScheme   | SourceScheme | `function` |             |
| setTileSize | number       | `function` |             |
| setBounds   | BBox         | `function` |             |
| setUrl      | string       | `function` |             |

### Geojson

#### Use

```ts
import { GeoJsonSourceBuild } from '@hungpvq/vue-map-layer';
new GeoJsonSourceBuild().setData(geojson);
```

#### Method

| State   | Props   | Type       | Description |
| ------- | ------- | ---------- | ----------- |
| setData | GeoJSON | `function` |             |

## Layer

### Use

```ts
import { LayerMapBuild } from '@hungpvq/vue-map-layer';
new LayerMapBuild().setLayer(layer);
```

### Method

| State     | Props         | Type       | Description |
| --------- | ------------- | ---------- | ----------- |
| setLayer  | MapboxLayer   | `function` |             |
| setLayers | MapboxLayer[] | `function` |             |
| setSource | MapboxSource  | `function` |             |

## Sample

```ts
import { LayerRasterMapboxBuild } from '@hungpvq/vue-map-layer';
new LayerMapBuild().setLayer(new LayerRasterMapboxBuild().build());
```

```ts
import { LayerSimpleMapboxBuild } from '@hungpvq/vue-map-layer';
new LayerMapBuild().setLayer(new LayerSimpleMapboxBuild().setColor(color).setStyleType(type:'point'|'line'|'area'|'symbol').build());
```
