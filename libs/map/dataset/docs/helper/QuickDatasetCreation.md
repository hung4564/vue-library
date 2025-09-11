# Quick Dataset Creation

## Usecase

- Provide quick and easy ways to create complete datasets with minimal code.
- Use helper functions for common dataset creation patterns.
- Support different data source types (GeoJSON, Raster) with simple configuration.
- Enable rapid prototyping and development of map applications.

## GeoJSON Dataset

### Basic GeoJSON Dataset

```typescript
import { createGeoJsonDataset } from '@hungpvq/vue-map-dataset';

const geojsonData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Point 1', id: 1 },
      geometry: {
        type: 'Point',
        coordinates: [105.8342, 21.0285],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Point 2', id: 2 },
      geometry: {
        type: 'Point',
        coordinates: [105.8442, 21.0385],
      },
    },
  ],
};

// Create complete dataset with one function call
const dataset = createGeoJsonDataset({
  name: 'My GeoJSON Dataset',
  geojson: geojsonData,
  type: 'point',
  color: '#ff6b6b',
});
```

### GeoJSON with Different Layer Types

#### Point Layer

```typescript
const pointDataset = createGeoJsonDataset({
  name: 'Points Dataset',
  geojson: pointGeoJSON,
  type: 'point',
  color: '#ff6b6b',
});
```

#### Line Layer

```typescript
const lineDataset = createGeoJsonDataset({
  name: 'Lines Dataset',
  geojson: lineGeoJSON,
  type: 'line',
  color: '#4ecdc4',
});
```

#### Area Layer (Polygon)

```typescript
const areaDataset = createGeoJsonDataset({
  name: 'Areas Dataset',
  geojson: polygonGeoJSON,
  type: 'area',
  color: '#45b7d1',
});
```

#### Symbol Layer

```typescript
const symbolDataset = createGeoJsonDataset({
  name: 'Symbols Dataset',
  geojson: symbolGeoJSON,
  type: 'symbol',
  color: '#f39c12',
});
```

### GeoJSON with Custom Properties

```typescript
const customDataset = createGeoJsonDataset({
  name: 'Custom Properties Dataset',
  geojson: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: 'Custom Point',
          category: 'important',
          value: 100,
        },
        geometry: {
          type: 'Point',
          coordinates: [105.8342, 21.0285],
        },
      },
    ],
  },
  type: 'point',
  color: '#e74c3c',
});
```

## Raster Dataset

### Basic Raster URL Dataset

```typescript
import { createRasterUrlDataset } from '@hungpvq/vue-map-dataset';

const rasterDataset = createRasterUrlDataset({
  name: 'My Raster Dataset',
  tiles: ['https://example.com/tiles/{z}/{x}/{y}.png'],
});
```

### Raster with Multiple Tile Sources

```typescript
const multiRasterDataset = createRasterUrlDataset({
  name: 'Multi Source Raster',
  tiles: ['https://tile1.example.com/{z}/{x}/{y}.png', 'https://tile2.example.com/{z}/{x}/{y}.png', 'https://tile3.example.com/{z}/{x}/{y}.png'],
});
```

### Raster with Bounds and Zoom Levels

```typescript
const boundedRasterDataset = createRasterUrlDataset({
  name: 'Bounded Raster Dataset',
  tiles: ['https://example.com/tiles/{z}/{x}/{y}.png'],
  bounds: [-180, -85.051129, 180, 85.051129], // [west, south, east, north]
  minZoom: 0,
  maxZoom: 18,
});
```

### Raster with Custom Bounds

```typescript
const customBoundsRaster = createRasterUrlDataset({
  name: 'Vietnam Raster',
  tiles: ['https://vietnam-tiles.example.com/{z}/{x}/{y}.png'],
  bounds: [102.144, 8.179, 109.464, 23.393], // Vietnam bounds
  minZoom: 5,
  maxZoom: 15,
});
```

### Satellite Imagery Raster

```typescript
const satelliteDataset = createRasterUrlDataset({
  name: 'Satellite Imagery',
  tiles: ['https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.jpg?access_token=YOUR_TOKEN'],
  minZoom: 0,
  maxZoom: 20,
});
```

### Weather Raster Layer

```typescript
const weatherDataset = createRasterUrlDataset({
  name: 'Weather Radar',
  tiles: ['https://weather.example.com/radar/{z}/{x}/{y}.png'],
  bounds: [-180, -85, 180, 85],
  minZoom: 2,
  maxZoom: 12,
});
```

## Integration Examples

### Adding Quick Datasets to Map

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <LayerControl position="top-left" show />
    <IdentifyControl position="top-right" />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { LayerControl, IdentifyControl, useMapDataset } from '@hungpvq/vue-map-dataset';
import { createGeoJsonDataset, createRasterUrlDataset } from '@hungpvq/vue-map-dataset';

function onMapLoaded(map: any) {
  const { addDataset } = useMapDataset(map.id);

  // Add GeoJSON dataset
  const geojsonDataset = createGeoJsonDataset({
    name: 'Cities',
    geojson: citiesGeoJSON,
    type: 'point',
    color: '#ff6b6b',
  });
  addDataset(geojsonDataset);

  // Add Raster dataset
  const rasterDataset = createRasterUrlDataset({
    name: 'Satellite',
    tiles: ['https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.jpg?access_token=YOUR_TOKEN'],
  });
  addDataset(rasterDataset);
}
</script>
```

### Multiple Quick Datasets

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <LayerControl position="top-left" show />
    <IdentifyControl position="top-right" />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { LayerControl, IdentifyControl, useMapDataset } from '@hungpvq/vue-map-dataset';
import { createGeoJsonDataset, createRasterUrlDataset } from '@hungpvq/vue-map-dataset';

function onMapLoaded(map: any) {
  const { addDataset } = useMapDataset(map.id);

  // Create multiple datasets
  const datasets = [
    // Points dataset
    createGeoJsonDataset({
      name: 'Points',
      geojson: pointsData,
      type: 'point',
      color: '#ff6b6b',
    }),

    // Lines dataset
    createGeoJsonDataset({
      name: 'Roads',
      geojson: roadsData,
      type: 'line',
      color: '#4ecdc4',
    }),

    // Areas dataset
    createGeoJsonDataset({
      name: 'Districts',
      geojson: districtsData,
      type: 'area',
      color: '#45b7d1',
    }),

    // Raster dataset
    createRasterUrlDataset({
      name: 'Elevation',
      tiles: ['https://elevation.example.com/{z}/{x}/{y}.png'],
      minZoom: 0,
      maxZoom: 15,
    }),
  ];

  // Add all datasets
  datasets.forEach((dataset) => addDataset(dataset));
}
</script>
```

## Configuration Options

### GeoJSON Dataset Options

```typescript
interface GeojsonDatasetOption {
  name: string; // Dataset name
  geojson: GeoJSON; // GeoJSON data
  type: 'point' | 'line' | 'area' | 'symbol'; // Layer type
  color?: string; // Optional color (default: random)
}
```

### Raster Dataset Options

```typescript
interface RasterUrlDatasetOption {
  name: string; // Dataset name
  tiles: string[]; // Tile URLs
  bounds?: [number, number, number, number]; // [west, south, east, north]
  minZoom?: number; // Minimum zoom level
  maxZoom?: number; // Maximum zoom level
}
```

## Best Practices

### 1. Use Appropriate Layer Types

```typescript
// For point data
const points = createGeoJsonDataset({
  name: 'Cities',
  geojson: pointData,
  type: 'point', // Use 'point' for individual locations
});

// For line data
const roads = createGeoJsonDataset({
  name: 'Highways',
  geojson: lineData,
  type: 'line', // Use 'line' for roads, rivers, etc.
});

// For polygon data
const areas = createGeoJsonDataset({
  name: 'Districts',
  geojson: polygonData,
  type: 'area', // Use 'area' for regions, districts, etc.
});
```

### 2. Optimize Raster Tiles

```typescript
// Use appropriate zoom levels
const optimizedRaster = createRasterUrlDataset({
  name: 'Optimized Raster',
  tiles: ['https://example.com/tiles/{z}/{x}/{y}.png'],
  minZoom: 3, // Don't load tiles below zoom 3
  maxZoom: 15, // Don't load tiles above zoom 15
});
```

### 3. Set Appropriate Bounds

```typescript
// Limit raster to specific geographic area
const regionalRaster = createRasterUrlDataset({
  name: 'Regional Data',
  tiles: ['https://example.com/tiles/{z}/{x}/{y}.png'],
  bounds: [100, 10, 110, 20], // Only load tiles in this area
  minZoom: 5,
  maxZoom: 12,
});
```

### 4. Error Handling

```typescript
try {
  const dataset = createGeoJsonDataset({
    name: 'My Dataset',
    geojson: geojsonData,
    type: 'point',
  });

  addDataset(dataset);
} catch (error) {
  console.error('Failed to create dataset:', error);
}
```

## Features

- **One-line Dataset Creation** - Create complete datasets with single function calls
- **Multiple Data Sources** - Support for GeoJSON and Raster data
- **Automatic Styling** - Default styling with optional customization
- **Type Safety** - Full TypeScript support
- **Performance Optimized** - Efficient dataset structure
- **Easy Integration** - Simple integration with map components
- **Flexible Configuration** - Customizable bounds, zoom levels, and styling
