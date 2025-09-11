# Source Dataset Component

## Overview

The Source dataset component defines data sources for map layers. Supported types include GeoJSON, raster tiles, and vector tiles.

## Use Cases

- Providing data for map layers
- Integrating external or dynamic data sources
- Supporting multiple data formats

## GeoJSON Source Example

```typescript
import { createDatasetPartGeojsonSourceComponent } from '@hungpvq/vue-map-dataset';

const source = createDatasetPartGeojsonSourceComponent('my-source', {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Feature 1' },
      geometry: {
        type: 'Point',
        coordinates: [105.8342, 21.0285],
      },
    },
  ],
});
```

## Raster Source Example

```typescript
import { createDatasetPartRasterSourceComponent } from '@hungpvq/vue-map-dataset';

const rasterSource = createDatasetPartRasterSourceComponent('raster-source', {
  type: 'raster',
  tiles: ['https://example.com/tiles/{z}/{x}/{y}.png'],
  tileSize: 256,
});
```

## Vector Tile Source Example

```typescript
import { createDatasetPartVectorTileComponent } from '@hungpvq/vue-map-dataset';

const vectorSource = createDatasetPartVectorTileComponent('vector-source', {
  type: 'vector',
  tiles: ['https://example.com/vector-tiles/{z}/{x}/{y}.pbf'],
  minzoom: 0,
  maxzoom: 14,
});
```

## API

- `createDatasetPartGeojsonSourceComponent(name: string, data: GeoJSON)`: Create a GeoJSON source
- `createDatasetPartRasterSourceComponent(name: string, options: object)`: Create a raster source
- `createDatasetPartVectorTileComponent(name: string, options: object)`: Create a vector tile source

## Best Practices

- Use appropriate source types for your data
- Optimize data for performance (e.g., tile sources for large datasets)
- Keep source names unique and descriptive
