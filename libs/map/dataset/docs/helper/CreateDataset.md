# Create Dataset

## Usecase

- Provide comprehensive guidance on creating datasets with various data sources and components.
- Demonstrate different patterns for building complete dataset structures.
- Show integration with map components and layer management.
- Enable developers to create both simple and complex dataset configurations.

## Dataset Structure

In the Vue Map Dataset library, a **dataset is represented as a tree structure** following the Composite pattern.
Instead of a flat list, each dataset can contain multiple child nodes of different types and you can freely combine or extend them.

- **Root Dataset** – The root (composite) node, acting as the main container.
- **Source Nodes** – Nodes that provide data sources such as GeoJSON, Raster, or Vector.
- **Layer Nodes** – Nodes that define Mapbox layer specifications linked to sources.
- **UI Nodes** – Components for list views, group views, and management interfaces.
- **Identify Nodes** – Components that handle feature identification and interaction.
- **Data Management Nodes** – Components for handling and displaying structured data.
- **Custom Nodes** – You can define your own dataset node types to extend functionality.

This tree-based approach allows you to organise and manage multiple datasets of various types in one unified, composable structure.

## Basic Dataset Creation

### Simple Dataset

```typescript
import { createDataset } from '@hungpvq/vue-map-dataset';

// Create a simple leaf dataset
const simpleDataset = createDataset('My Dataset', { someData: 'value' });

// Create a composite dataset (can contain children)
const compositeDataset = createDataset('My Composite Dataset', null, true);
```

### Complete Dataset with GeoJSON

```typescript
import { createDataset, createDatasetPartGeojsonSourceComponent, createDatasetPartListViewUiComponent, createMultiMapboxLayerComponent, createIdentifyMapboxComponent, createDatasetPartDataManagementComponent, LayerSimpleMapboxBuild } from '@hungpvq/vue-map-dataset';

// Create root dataset
const dataset = createDataset('Sample Dataset', null, true);

// 1. Create GeoJSON source
const source = createDatasetPartGeojsonSourceComponent('source', {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Sample Point' },
      geometry: {
        type: 'Point',
        coordinates: [105.8342, 21.0285],
      },
    },
  ],
});

// 2. Create list view UI
const listView = createDatasetPartListViewUiComponent('Sample Layer');
listView.color = '#ff6b6b';
listView.opacity = 0.8;

// 3. Create layer with styling
const layer = createMultiMapboxLayerComponent('sample-layer', [new LayerSimpleMapboxBuild().setStyleType('point').setColor(listView.color).setOpacity(listView.opacity).build()]);

// 4. Create identify component
const identify = createIdentifyMapboxComponent('sample-identify');

// 5. Create data management
const dataManagement = createDatasetPartDataManagementComponent('sample-data', {
  fields: [
    { text: 'Name', value: 'name' },
    { text: 'ID', value: 'id' },
  ],
});

// Add all components to dataset
dataset.add(source);
dataset.add(listView);
dataset.add(layer);
dataset.add(identify);
dataset.add(dataManagement);
```

## Quick Dataset Creation

For quick and easy dataset creation using helper functions, see [Quick Dataset Creation](./QuickDatasetCreation.md).

## Dataset Components

### Source Components

#### GeoJSON Source

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

#### Raster Source

```typescript
import { createDatasetPartRasterSourceComponent } from '@hungpvq/vue-map-dataset';

const rasterSource = createDatasetPartRasterSourceComponent('raster-source', {
  type: 'raster',
  tiles: ['https://example.com/tiles/{z}/{x}/{y}.png'],
  tileSize: 256,
});
```

#### Vector Tile Source

```typescript
import { createDatasetPartVectorTileComponent } from '@hungpvq/vue-map-dataset';

const vectorSource = createDatasetPartVectorTileComponent('vector-source', {
  type: 'vector',
  tiles: ['https://example.com/vector-tiles/{z}/{x}/{y}.pbf'],
  minzoom: 0,
  maxzoom: 14,
});
```

### Layer Components

```typescript
import { createMultiMapboxLayerComponent, LayerSimpleMapboxBuild } from '@hungpvq/vue-map-dataset';

// Single layer
const singleLayer = createMultiMapboxLayerComponent('single-layer', [new LayerSimpleMapboxBuild().setStyleType('point').setColor('#ff6b6b').build()]);

// Multiple layers
const multiLayer = createMultiMapboxLayerComponent('multi-layer', [new LayerSimpleMapboxBuild().setStyleType('point').setColor('#ff6b6b').build(), new LayerSimpleMapboxBuild().setStyleType('line').setColor('#4ecdc4').build()]);
```

### UI Components

#### List View

```typescript
import { createDatasetPartListViewUiComponent } from '@hungpvq/vue-map-dataset';

const listView = createDatasetPartListViewUiComponent('My Layer');
listView.color = '#ff6b6b';
listView.opacity = 0.8;
listView.visible = true;
```

#### Group List View

```typescript
import { createDatasetPartGroupSubListViewUiComponent } from '@hungpvq/vue-map-dataset';

const groupView = createDatasetPartGroupSubListViewUiComponent('My Group');
// Can add sub-items to group
```

### Identify Components

```typescript
import { createIdentifyMapboxComponent } from '@hungpvq/vue-map-dataset';

const identify = createIdentifyMapboxComponent('my-identify', {
  field_name: 'name',
  field_id: 'id',
});

// Add menu actions
identify.addMenus([
  {
    type: 'item',
    location: 'menu',
    name: 'Show Details',
    click: 'show-detail',
  },
  {
    type: 'item',
    location: 'menu',
    name: 'Zoom to Feature',
    click: 'zoom-to',
  },
]);
```

### Data Management Components

```typescript
import { createDatasetPartDataManagementComponent } from '@hungpvq/vue-map-dataset';

const dataManagement = createDatasetPartDataManagementComponent('my-data', {
  fields: [
    { text: 'Name', value: 'name' },
    { text: 'Type', value: 'type' },
    { text: 'Description', value: 'description' },
  ],
});

// Set data items
dataManagement.setItems([
  { id: 1, name: 'Item 1', type: 'Point', description: 'First item' },
  { id: 2, name: 'Item 2', type: 'Line', description: 'Second item' },
]);
```

## Integration with Map

### Adding Dataset to Map

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <LayerControl position="top-left" show />
    <IdentifyControl position="top-right" />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { LayerControl, IdentifyControl, useMapDataset, createDataset } from '@hungpvq/vue-map-dataset';

function onMapLoaded(map: any) {
  const { addDataset } = useMapDataset(map.id);

  // Create and add your dataset
  const dataset = createDataset('My Dataset', null, true);
  addDataset(dataset);
}
</script>
```

### Complete Example

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <LayerControl position="top-left" show />
    <IdentifyControl position="top-right" />
    <IdentifyShowFirstControl />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { LayerControl, IdentifyControl, IdentifyShowFirstControl, useMapDataset, createDataset, createDatasetPartGeojsonSourceComponent, createDatasetPartListViewUiComponent, createMultiMapboxLayerComponent, createIdentifyMapboxComponent, createDatasetPartDataManagementComponent, LayerSimpleMapboxBuild } from '@hungpvq/vue-map-dataset';

function onMapLoaded(map: any) {
  const { addDataset } = useMapDataset(map.id);

  // Create complete dataset
  const dataset = createDataset('Complete Dataset', null, true);

  // Add source
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'Sample Point', id: 1 },
        geometry: {
          type: 'Point',
          coordinates: [105.8342, 21.0285],
        },
      },
    ],
  });

  // Add list view
  const listView = createDatasetPartListViewUiComponent('Sample Layer');
  listView.color = '#ff6b6b';

  // Add layer
  const layer = createMultiMapboxLayerComponent('sample-layer', [new LayerSimpleMapboxBuild().setStyleType('point').setColor(listView.color).build()]);

  // Add identify
  const identify = createIdentifyMapboxComponent('sample-identify', {
    field_name: 'name',
    field_id: 'id',
  });

  // Add data management
  const dataManagement = createDatasetPartDataManagementComponent('sample-data', {
    fields: [
      { text: 'Name', value: 'name' },
      { text: 'ID', value: 'id' },
    ],
  });

  // Assemble dataset
  dataset.add(source);
  dataset.add(listView);
  dataset.add(layer);
  dataset.add(identify);
  dataset.add(dataManagement);

  // Add to map
  addDataset(dataset);
}
</script>
```

## Best Practices

### 1. Dataset Organization

```typescript
// Group related components together
const dataset = createDataset('Main Dataset', null, true);

// Create sub-groups for different data types
const pointsGroup = createDataset('Points', null, true);
const linesGroup = createDataset('Lines', null, true);

dataset.add(pointsGroup);
dataset.add(linesGroup);
```

### 2. Consistent Naming

```typescript
const baseName = 'my-feature';

const source = createDatasetPartGeojsonSourceComponent(`${baseName}-source`, data);
const listView = createDatasetPartListViewUiComponent(`${baseName}-list`);
const layer = createMultiMapboxLayerComponent(`${baseName}-layer`, [layerSpec]);
const identify = createIdentifyMapboxComponent(`${baseName}-identify`);
```

### 3. Error Handling

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

### 4. Performance Optimization

```typescript
// Use appropriate layer types for data
const pointLayer = new LayerSimpleMapboxBuild().setStyleType('point').setColor('#ff6b6b').build();

const lineLayer = new LayerSimpleMapboxBuild().setStyleType('line').setColor('#4ecdc4').build();

// Group similar features
const groupedLayer = createMultiMapboxLayerComponent('grouped', [pointLayer, lineLayer]);
```

## Features

- **Composite Pattern** - Hierarchical dataset organization
- **Type Safety** - Full TypeScript support
- **Flexible Sources** - GeoJSON, Raster, Vector Tile support
- **Rich UI Components** - List views, groups, and management interfaces
- **Identify Capabilities** - Feature identification and interaction
- **Data Management** - Structured data handling and display
- **Mapbox Integration** - Seamless integration with Mapbox GL JS
- **Extensible** - Easy to add custom components and functionality
