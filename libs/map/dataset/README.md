# Map Dataset

> Vue.js library for managing and visualizing map data with high interactivity

## 🚀 Introduction

Map Dataset is a powerful Vue.js library for managing, displaying, and interacting with map data. The library supports multiple data formats and provides components for displaying layers, legends, and interactive controls.

## 📦 Installation

```bash
npm install @hungpvq/vue-map-dataset
```

```bash
yarn add @hungpvq/vue-map-dataset
```

## 🎯 Features

- ✅ **Multi-format support** - Support for GeoJSON, KML, Shapefile, CSV
- ✅ **Layer management** - Dynamic layer management
- ✅ **Legend components** - Interactive legend display
- ✅ **Data visualization** - Data display with multiple styles
- ✅ **Interactive controls** - Interactive controls
- ✅ **TypeScript support** - Full TypeScript support
- ✅ **Vue 3 Composition API** - Uses Composition API

## 🚀 Basic Usage

### Dataset Management

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <DatasetControl position="top-left" show />
    <LayerControl position="top-left" show />
  </Map>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getUUIDv4 } from '@hungpvq/shared';
import { Map } from '@hungpvq/vue-map-core';
import { DatasetControl, LayerControl, useMapDataset, createDataset, createDatasetPartGeojsonSourceComponent, createDatasetPartListViewUiComponent, createMultiMapboxLayerComponent, LayerSimpleMapboxBuild } from '@hungpvq/vue-map-dataset';

const mapId = ref(getUUIDv4());
const { addDataset } = useMapDataset(mapId.value);

function onMapLoaded(map: any) {
  mapId.value = map.id;
  const { addDataset: addDatasetToMap } = useMapDataset(mapId.value);

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

  addDatasetToMap(dataset);
}
</script>
```

### Layer Controls

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <LayerControlInfo :layers="layers" @layer-toggle="handleLayerToggle" @layer-style-change="handleStyleChange" />

    <InfoLayerControl :layers="layers" @identify="handleIdentify" />
  </Map>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { LayerControlInfo, InfoLayerControl } from '@hungpvq/vue-map-dataset';

const layers = ref([
  {
    id: 'buildings',
    name: 'Buildings',
    visible: true,
    opacity: 0.8,
    style: {
      fillColor: '#ff9ff3',
      strokeColor: '#f368e0',
    },
  },
]);

function handleLayerToggle(layerId: string, visible: boolean) {
  const layer = layers.value.find((l) => l.id === layerId);
  if (layer) {
    layer.visible = visible;
  }
}

function handleStyleChange(layerId: string, style: any) {
  const layer = layers.value.find((l) => l.id === layerId);
  if (layer) {
    layer.style = { ...layer.style, ...style };
  }
}

function handleIdentify(features: any[]) {
  console.info('Identified features:', features);
}
</script>
```

### Multi Identify

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <MultiIdentify :layers="identifyLayers" @features-identified="handleFeaturesIdentified" />
  </Map>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MultiIdentify } from '@hungpvq/vue-map-dataset';

const identifyLayers = ref(['buildings', 'roads', 'parks']);

function handleFeaturesIdentified(results: any[]) {
  console.info('Identified features from multiple layers:', results);
}
</script>
```

## 📚 API Reference

### DatasetManager Component

#### Props

| Prop       | Type        | Default | Description           |
| ---------- | ----------- | ------- | --------------------- |
| `datasets` | `Dataset[]` | `[]`    | Danh sách datasets    |
| `autoLoad` | `boolean`   | `true`  | Tự động load datasets |
| `maxZoom`  | `number`    | `18`    | Zoom level tối đa     |

#### Events

| Event             | Payload   | Description               |
| ----------------- | --------- | ------------------------- |
| `dataset-added`   | `Dataset` | Khi dataset được thêm     |
| `dataset-removed` | `string`  | Khi dataset được xóa      |
| `dataset-updated` | `Dataset` | Khi dataset được cập nhật |

### LayerControlInfo Component

#### Props

| Prop          | Type      | Default | Description              |
| ------------- | --------- | ------- | ------------------------ |
| `layers`      | `Layer[]` | `[]`    | Danh sách layers         |
| `showOpacity` | `boolean` | `true`  | Hiển thị opacity control |
| `showStyle`   | `boolean` | `true`  | Hiển thị style controls  |

#### Events

| Event                | Payload                          | Description              |
| -------------------- | -------------------------------- | ------------------------ |
| `layer-toggle`       | `{id: string, visible: boolean}` | Khi layer được toggle    |
| `layer-style-change` | `{id: string, style: any}`       | Khi style layer thay đổi |

### Dataset Interface

```typescript
interface Dataset {
  id: string;
  name: string;
  type: 'geojson' | 'kml' | 'shapefile' | 'csv';
  url?: string;
  data?: any;
  visible: boolean;
  opacity: number;
  style: LayerStyle;
  metadata?: DatasetMetadata;
}

interface LayerStyle {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  strokeOpacity?: number;
  radius?: number;
  icon?: string;
  iconSize?: number;
}
```

## 🔧 Advanced Usage

### Custom Data Sources

```vue
<script setup lang="ts">
import { useDatasetManager } from '@hungpvq/vue-map-dataset';

const { addDataset, removeDataset, updateDataset } = useDatasetManager();

// Thêm dataset từ API
async function loadDataFromAPI() {
  const response = await fetch('/api/geodata');
  const data = await response.json();

  addDataset({
    id: 'api-data',
    name: 'API Data',
    type: 'geojson',
    data: data,
    visible: true,
    style: {
      fillColor: '#74b9ff',
      strokeColor: '#0984e3',
    },
  });
}

// Thêm dataset từ file upload
function handleFileUpload(file: File) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = JSON.parse(e.target?.result as string);
    addDataset({
      id: 'uploaded-data',
      name: file.name,
      type: 'geojson',
      data: data,
      visible: true,
      style: {
        fillColor: '#00b894',
        strokeColor: '#00a085',
      },
    });
  };
  reader.readAsText(file);
}
</script>
```

### Dynamic Styling

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <StyleControl :layer="selectedLayer" @style-change="handleStyleChange" />
  </Map>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { StyleControl } from '@hungpvq/vue-map-dataset'

const selectedLayer = ref(null)
const layers = ref([...])

const layerStyles = computed(() => {
  return layers.value.map(layer => ({
    id: layer.id,
    name: layer.name,
    style: layer.style
  }))
})

function handleStyleChange(layerId: string, newStyle: any) {
  const layer = layers.value.find(l => l.id === layerId)
  if (layer) {
    layer.style = { ...layer.style, ...newStyle }
  }
}
</script>
```

### Data Filtering

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <DrawControl :drawOptions="drawOptions" @draw-complete="handleDrawComplete" />

    <FilterControl :filters="filters" @filter-change="handleFilterChange" />
  </Map>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DrawControl, FilterControl } from '@hungpvq/vue-map-dataset';

const drawOptions = ref({
  drawPolygon: true,
  drawCircle: true,
  drawRectangle: true,
});

const filters = ref([
  {
    id: 'population',
    name: 'Population',
    type: 'range',
    min: 0,
    max: 1000000,
    value: [10000, 100000],
  },
  {
    id: 'type',
    name: 'Type',
    type: 'select',
    options: ['City', 'Town', 'Village'],
    value: ['City', 'Town'],
  },
]);

function handleDrawComplete(geometry: any) {
  console.info('Draw completed:', geometry);
  // Apply spatial filter
}

function handleFilterChange(filters: any) {
  console.info('Filters changed:', filters);
  // Apply attribute filters
}
</script>
```

## 🎨 Styling và Theming

### CSS Variables

```css
:root {
  --dataset-control-bg: #ffffff;
  --dataset-control-border: #e5e5e5;
  --dataset-control-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --dataset-layer-item-bg: #f8f9fa;
  --dataset-layer-item-hover: #e9ecef;
  --dataset-legend-bg: #ffffff;
  --dataset-legend-border: #dee2e6;
}
```

### Custom Styling

```vue
<template>
  <DatasetManager :datasets="datasets" class="custom-dataset-manager" />
</template>

<style>
.custom-dataset-manager {
  --dataset-control-bg: #2c3e50;
  --dataset-control-text: #ecf0f1;
  --dataset-layer-item-bg: #34495e;
  --dataset-layer-item-hover: #4a6741;
}

.custom-dataset-manager .layer-item {
  border-radius: 6px;
  margin: 4px 0;
  padding: 8px 12px;
}
</style>
```

## 📊 Data Formats

### GeoJSON

```typescript
const geojsonDataset = {
  id: 'geojson-example',
  name: 'GeoJSON Example',
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [105.8342, 21.0285],
        },
        properties: {
          name: 'Hanoi',
          population: 8000000,
        },
      },
    ],
  },
};
```

### CSV with Coordinates

```typescript
const csvDataset = {
  id: 'csv-example',
  name: 'CSV Example',
  type: 'csv',
  data: [
    { name: 'Hanoi', lat: 21.0285, lng: 105.8342, population: 8000000 },
    { name: 'Ho Chi Minh', lat: 10.8231, lng: 106.6297, population: 9000000 },
  ],
  coordinateFields: {
    latitude: 'lat',
    longitude: 'lng',
  },
};
```

## 🧪 Testing

```bash
# Chạy tests
nx test map-dataset

# Chạy tests với coverage
nx test map-dataset --coverage
```

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - xem [LICENSE](../../LICENSE) để biết thêm chi tiết.

## 🔗 Liên kết

- **[GitHub Repository](https://github.com/hung4564/vue-library)**
- **[Documentation](./docs/)**
- **[Issues](https://github.com/hung4564/vue-library/issues)**
