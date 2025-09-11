# Map Dataset docs

> Vue.js library for managing and visualizing map data with high interactivity

## 🚀 Introduction

Map Dataset provides components and utilities to create, list, style, identify and manage map layers/datasets. It supports GeoJSON and raster sources, dynamic legends, identify tools, and layer grouping with drag-and-drop functionality.

## 📦 Installation

```bash
npm install @hungpvq/vue-map-dataset
```

```bash
yarn add @hungpvq/vue-map-dataset
```

## 🎯 Features

- ✅ **Dataset and layer management** - Create, group, reorder, and delete layers dynamically
- ✅ **Identify tools** - Click and box select with immediate show-first functionality
- ✅ **Style editor** - Comprehensive styling for Mapbox layers
- ✅ **Legends** - Linear gradient, single color, and single value legends
- ✅ **Component manager** - Dynamic UI components for dataset management
- ✅ **TypeScript support** - Full TypeScript support with comprehensive type definitions
- ✅ **Vue 3 Composition API** - Modern Vue 3 Composition API integration
- ✅ **Drag and drop** - Intuitive layer organization with drag-and-drop support

## 🚀 Usage

### Basic Layer Management

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <LayerControl position="top-left" show />
  </Map>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getUUIDv4 } from '@hungpvq/shared';
import { Map } from '@hungpvq/vue-map-core';
import { LayerControl, useMapDataset, createDataset, createDatasetPartGeojsonSourceComponent, createDatasetPartListViewUiComponent, createMultiMapboxLayerComponent, LayerSimpleMapboxBuild } from '@hungpvq/vue-map-dataset';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';

const mapId = ref(getUUIDv4());

function onMapLoaded(map: any) {
  mapId.value = map.id;
  const { addDataset } = useMapDataset(mapId.value);

  // Create sample dataset
  const dataset = createDataset('Sample Dataset', null, true);

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

  const listView = createDatasetPartListViewUiComponent('Sample Layer');
  listView.color = '#ff6b6b';

  const layer = createMultiMapboxLayerComponent('sample-layer', [new LayerSimpleMapboxBuild().setStyleType('point').setColor(listView.color).build()]);

  dataset.add(source);
  dataset.add(listView);
  dataset.add(layer);

  addDataset(dataset);
}
</script>
```

### Identify Controls

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <IdentifyControl position="top-right" />
    <IdentifyShowFirstControl />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { IdentifyControl, IdentifyShowFirstControl } from '@hungpvq/vue-map-dataset';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';

function onMapLoaded(map: any) {
  // Initialize datasets with identify capabilities
}
</script>
```

### Layer Information Display

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <LayerInfoControl position="bottom-right" />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { LayerInfoControl } from '@hungpvq/vue-map-dataset';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
</script>
```

### Complete Integration Example

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <!-- Core controls -->
    <ZoomControl position="top-right" />
    <HomeControl position="top-right" />

    <!-- Dataset controls -->
    <LayerControl position="top-left" show>
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerControl>

    <LayerInfoControl position="bottom-right" />
    <IdentifyControl position="top-right" />
    <IdentifyShowFirstControl />
  </Map>
</template>

<script setup lang="ts">
import { Map, ZoomControl, HomeControl } from '@hungpvq/vue-map-core';
import { LayerControl, LayerInfoControl, IdentifyControl, IdentifyShowFirstControl } from '@hungpvq/vue-map-dataset';
import { BaseMapCard } from '@hungpvq/vue-map-basemap';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
import '@hungpvq/vue-map-basemap/style.css';

function onMapLoaded(map: any) {
  // Initialize your datasets here
}
</script>
```
