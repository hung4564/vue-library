# Map Measurement

> Vue.js library for measuring distances, areas, and other measurements on maps

## 🚀 Introduction

Map Measurement is a Vue.js library that provides components for measuring distances, areas, and other measurements on maps. The library supports high-precision measurements, multiple units, and professional measurement tools.

## 📦 Installation

```bash
npm install @hungpvq/vue-map-measurement
```

```bash
yarn add @hungpvq/vue-map-measurement
```

## 🎯 Features

- ✅ **Distance measurement** - Measure distances between points
- ✅ **Area measurement** - Measure areas of polygons
- ✅ **Multiple units** - Support for various measurement units
- ✅ **Custom actions** - Add custom measurement actions
- ✅ **High precision** - Accurate measurements using Turf.js
- ✅ **Export support** - Export measurements to various formats
- ✅ **TypeScript support** - Full TypeScript support
- ✅ **Vue 3 Composition API** - Modern Vue 3 Composition API

## 🚀 Basic Usage

### Basic Measurement Control

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <MeasurementControl position="top-right" :actions="measurementActions" />
  </Map>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Map } from '@hungpvq/vue-map-core';
import { MeasurementControl, type MeasureActionItem } from '@hungpvq/vue-map-measurement';
import { mdiPlus } from '@mdi/js';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-measurement/style.css';

const measurementActions: MeasureActionItem[] = [
  {
    title: 'Add to layer',
    icon: mdiPlus,
    type: 'add-to-layer',
    handle: (data) => {
      console.info('Add to layer:', data);
    },
    disabled: (ctx) => !ctx.coordinates || ctx.coordinates.length < 1,
    index: 0,
  },
];

function onMapLoaded(map: any) {
  console.info('Map loaded:', map);
}
</script>
```

## 📚 API Reference

### MeasurementControl Component

#### Props

| Prop             | Type                  | Default       | Description                |
| ---------------- | --------------------- | ------------- | -------------------------- |
| `mapId`          | `string`              | `''`          | Map identifier             |
| `position`       | `Position`            | `'top-right'` | Control position           |
| `controlVisible` | `boolean`             | `true`        | Control visibility         |
| `actions`        | `MeasureActionItem[]` | `[]`          | Custom measurement actions |

### MeasureActionItem Interface

```typescript
interface MeasureActionItem {
  title: string;
  icon: string;
  type: string;
  show?: (ctx: any) => boolean;
  handle: (ctx: any) => void;
  disabled?: (ctx: any) => boolean;
  index: number;
}
```

### Types

```typescript
interface MeasurementOptions {
  units?: {
    distance?: 'meters' | 'kilometers' | 'feet' | 'miles';
    area?: 'square-meters' | 'square-kilometers' | 'hectares' | 'acres';
    angle?: 'degrees' | 'radians' | 'gradians';
  };
  precision?: number;
  showLabels?: boolean;
  showTooltips?: boolean;
  allowMultiple?: boolean;
  snapToFeatures?: boolean;
  snapTolerance?: number;
}

interface MeasurementSettings extends MeasurementOptions {
  showMeasurements?: boolean;
  showBearing?: boolean;
  showCoordinates?: boolean;
  autoSave?: boolean;
  exportFormat?: 'geojson' | 'kml' | 'csv' | 'json';
}

interface CustomUnit {
  type: 'distance' | 'area' | 'angle';
  name: string;
  label: string;
  factor: number;
  precision: number;
}

interface MeasurementTool {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface CustomTool extends MeasurementTool {
  handler: (coordinates: any[]) => any;
}

interface MeasurementResult {
  id: string;
  type: 'distance' | 'area' | 'angle' | 'bearing';
  value: number;
  unit: string;
  coordinates: any[];
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

## 🤝 Contributing

All contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License

## 🔗 Links

- **[GitHub Repository](https://github.com/hung4564/vue-library)**
- **[Documentation](./docs/)**
- **[Issues](https://github.com/hung4564/vue-library/issues)**
