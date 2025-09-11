# Map Libraries

> Comprehensive Vue.js libraries for building interactive map applications with MapLibre GL

## 🚀 Overview

The Vue Library Map collection provides a complete set of Vue.js components and utilities for building powerful, interactive map applications. Built on top of MapLibre GL, these libraries offer everything you need to create professional mapping solutions.

## 📦 Available Libraries

### Core Libraries

- **[@hungpvq/vue-map-core](./core/)** - Core map functionality and components
- **[@hungpvq/vue-map-basemap](./basemap/)** - Base map controls and switching
- **[@hungpvq/vue-map-draw](./draw/)** - Drawing and editing tools
- **[@hungpvq/vue-map-measurement](./measurement/)** - Distance and area measurement
- **[@hungpvq/vue-map-print](./print/)** - Map printing functionality
- **[@hungpvq/vue-map-dataset](./dataset/)** - Dataset management and visualization
- **[@hungpvq/vue-map-legend](./legend/)** - Legend components

## 🚀 Quick Start

### Installation

```bash
# Install all map libraries
npm install @hungpvq/vue-map-core @hungpvq/vue-map-basemap @hungpvq/vue-map-draw @hungpvq/vue-map-measurement @hungpvq/vue-map-print @hungpvq/vue-map-dataset @hungpvq/vue-map-legend

# Or install individually
npm install @hungpvq/vue-map-core
```

### Basic Map Setup

```vue
<template>
  <Map :mapId="mapId" @map-loaded="onMapLoaded">
    <!-- Navigation Controls -->
    <ZoomControl position="top-right" />
    <HomeControl position="top-right" />
    <FullScreenControl position="top-right" />

    <!-- Base Map Control -->
    <BaseMapControl position="bottom-left" />

    <!-- Drawing Tools -->
    <DrawControl position="top-right" />

    <!-- Measurement Tools -->
    <MeasurementControl position="top-right" />

    <!-- Print Controls -->
    <PrintControl />

    <!-- Dataset Management -->
    <DatasetControl position="top-left" show />
    <LayerControl position="top-left" show />

    <!-- Legend -->
    <LegendControl />
  </Map>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getUUIDv4 } from '@hungpvq/shared';

// Core Map Components
import { Map, ZoomControl, HomeControl, FullScreenControl } from '@hungpvq/vue-map-core';

// Basemap Components
import { BaseMapControl } from '@hungpvq/vue-map-basemap';

// Draw Components
import { DrawControl } from '@hungpvq/vue-map-draw';

// Measurement Components
import { MeasurementControl } from '@hungpvq/vue-map-measurement';

// Print Components
import { PrintControl } from '@hungpvq/vue-map-print';

// Dataset Components
import { DatasetControl, LayerControl } from '@hungpvq/vue-map-dataset';

// Legend Components
import { LegendControl } from '@hungpvq/vue-map-legend';

// Styles
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-basemap/style.css';
import '@hungpvq/vue-map-draw/style.css';
import '@hungpvq/vue-map-measurement/style.css';
import '@hungpvq/vue-map-print/style.css';

const mapId = ref(getUUIDv4());

function onMapLoaded(map: any) {
  console.log('Map loaded:', map);
}
</script>
```

## 🎯 Key Features

### Map Core

- **Map Component** - Main map container with MapLibre GL
- **Navigation Controls** - Zoom, home, fullscreen, geolocation
- **Information Controls** - Mouse coordinates, settings, CRS
- **Event Management** - Comprehensive event handling system

### Base Map Management

- **Multiple Base Maps** - Support for various map providers
- **Base Map Switching** - Easy switching between different base maps
- **Custom Base Maps** - Add your own custom base map sources
- **Base Map Comparison** - Side-by-side base map comparison

### Drawing Tools

- **Point Drawing** - Draw individual points
- **Line Drawing** - Draw lines and paths
- **Polygon Drawing** - Draw areas and polygons
- **Edit Mode** - Edit existing features
- **Inspect Mode** - Inspect and analyze drawn features

### Measurement Tools

- **Distance Measurement** - Measure distances between points
- **Area Measurement** - Measure areas of polygons
- **Custom Actions** - Add custom measurement actions
- **Multiple Units** - Support for various measurement units

### Print Functionality

- **Basic Printing** - Simple map printing
- **Advanced Printing** - Custom layouts and settings
- **Multiple Formats** - PDF and image export
- **Print Preview** - Preview before printing

### Dataset Management

- **Layer Management** - Dynamic layer control
- **Data Visualization** - Multiple data formats support
- **Interactive Controls** - Identify, highlight, and style controls
- **Data Management** - Add, edit, and remove datasets

### Legend Components

- **Dynamic Legends** - Auto-generated from layers
- **Custom Legends** - Customizable legend items
- **Interactive Legends** - Click to toggle layers
- **Multiple Types** - Simple, categorized, and gradient legends

## 🔧 Advanced Usage

### Custom Map Configuration

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Map } from '@hungpvq/vue-map-core';

const mapId = ref('custom-map');

const initOptions = ref({
  center: [105.8342, 21.0285], // Hanoi coordinates
  zoom: 10,
  maxZoom: 22,
  minZoom: 1,
  style: 'https://demotiles.maplibre.org/style.json',
  attributionControl: false,
  zoomControl: false,
});

function onMapLoaded(map: any) {
  // Add custom event listeners
  map.on('click', (e: any) => {
    console.log('Map clicked:', e.lngLat);
  });

  map.on('move', () => {
    console.log('Map moved:', map.getCenter());
  });
}
</script>
```

### Dataset Integration

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useMapDataset } from '@hungpvq/vue-map-dataset';
import { createDataset, createDatasetPartGeojsonSourceComponent, createDatasetPartListViewUiComponent, createMultiMapboxLayerComponent, LayerSimpleMapboxBuild } from '@hungpvq/vue-map-dataset';

const mapId = ref('dataset-map');
const { addDataset } = useMapDataset(mapId.value);

function createSampleDataset() {
  const dataset = createDataset('Sample Dataset', null, true);

  // Create GeoJSON source
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

  // Create list view component
  const listView = createDatasetPartListViewUiComponent('Sample Layer');
  listView.color = '#ff6b6b';

  // Create mapbox layer
  const layer = createMultiMapboxLayerComponent('sample-layer', [new LayerSimpleMapboxBuild().setStyleType('point').setColor(listView.color).build()]);

  dataset.add(source);
  dataset.add(listView);
  dataset.add(layer);

  return dataset;
}

function onMapLoaded(map: any) {
  addDataset(createSampleDataset());
}
</script>
```

## 📚 Documentation Structure

- **[Core](./core/)** - Core map functionality and components
- **[Basemap](./basemap/)** - Base map controls and switching
- **[Draw](./draw/)** - Drawing and editing tools
- **[Measurement](./measurement/)** - Distance and area measurement
- **[Print](./print/)** - Map printing functionality
- **[Dataset](./dataset/)** - Dataset management and visualization
- **[Legend](./legend/)** - Legend components

## 🛠️ Development

### Building the Libraries

```bash
# Build all map libraries
npm run map:build

# Build specific library
nx build map-core
nx build map-basemap
nx build map-draw
nx build map-measurement
nx build map-print
nx build map-dataset
nx build map-legend
```

### Running Demos

```bash
# Run map demo
npm run demo:map

# Run specific demo
nx serve demo-map
```

## 🤝 Contributing

We welcome contributions!

## 📄 License

MIT License

## 🔗 Links

- **[GitHub Repository](https://github.com/hung4564/vue-library)**
- **[Documentation](./)**
- **[Issues](https://github.com/hung4564/vue-library/issues)**
