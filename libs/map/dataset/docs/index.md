# Map Dataset docs

> Vue.js library for managing and visualizing map data with high interactivity

## 🚀 Introduction

Map Dataset provides components and utilities to create, list, style, identify and manage map layers/datasets. It supports GeoJSON and raster sources, dynamic legends, identify tools, and layer grouping with drag-and-drop.

## 📦 Installation

```bash
npm install @hungpvq/vue-map-dataset
```

```bash
yarn add @hungpvq/vue-map-dataset
```

## 🎯 Features

- ✅ Dataset and layer management (create, group, reorder, delete)
- ✅ Identify tools (click and box select, immediate show-first)
- ✅ Style editor for Mapbox layers
- ✅ Legends (linear gradient, single color, single value)
- ✅ Component manager for dynamic UIs
- ✅ TypeScript + Vue 3 Composition API

## 🚀 Usage

### Layer Controls

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
import { DatasetControl, LayerControl, useMapDataset, createDataset, createDatasetPartGeojsonSourceComponent, createDatasetPartListViewUiComponent, createMultiMapboxLayerComponent, LayerSimpleMapboxBuild } from '@hungpvq/vue-map-dataset';

const mapId = ref(getUUIDv4());

function onMapLoaded(map: any) {
  mapId.value = map.id;
  const { addDataset } = useMapDataset(mapId.value);

  const dataset = createDataset('Sample Dataset', null, true);

  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'Sample Point' },
        geometry: { type: 'Point', coordinates: [105.8342, 21.0285] },
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

function onMapLoaded(map: any) {}
</script>
```

### Style Control

```vue
<StyleControl :item="dataset" />
```

## 🔗 Integration

- Works with `@hungpvq/vue-map-core` map/controls, and can be combined with basemaps.
- LayerControl exposes slots like `#endList` for inserting other UI (e.g., basemap card).
