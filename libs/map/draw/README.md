# Map Draw

> Vue.js library for drawing and editing geographic objects on maps

## 🚀 Introduction

Map Draw is a Vue.js library that provides components for drawing and editing geographic objects on maps. The library supports drawing points, lines, polygons, and other complex shapes with an intuitive and easy-to-use interface.

## 📦 Installation

```bash
npm install @hungpvq/vue-map-draw
```

```bash
yarn add @hungpvq/vue-map-draw
```

## 🎯 Features

- ✅ **Drawing tools** - Point, line, and polygon drawing tools
- ✅ **Edit tools** - Edit existing features
- ✅ **Multiple geometries** - Support for various geometry types
- ✅ **Inspect mode** - Inspect and analyze drawn features
- ✅ **Custom styling** - Customizable drawing styles
- ✅ **Integration** - Easy integration with dataset management
- ✅ **TypeScript support** - Full TypeScript support
- ✅ **Vue 3 Composition API** - Modern Vue 3 Composition API

## 🚀 Basic Usage

### Basic Draw Control

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <DrawControl position="top-right" :drawOptions="drawOptions" />
  </Map>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Map } from '@hungpvq/vue-map-core';
import { DrawControl, DrawingType, type DrawOption } from '@hungpvq/vue-map-draw';
import '@hungpvq/vue-map-core/style.css';

const drawOptions: DrawOption = {
  draw_support: [DrawingType.POINT, DrawingType.LINE_STRING, DrawingType.POLYGON],
  async save(geojson: any) {
    console.log('Save drawing:', geojson);
  },
};

function onMapLoaded(map: any) {
  console.log('Map loaded:', map);
}
</script>
```

## 📚 API Reference

### DrawControl Component

#### Props

| Prop             | Type         | Default       | Description            |
| ---------------- | ------------ | ------------- | ---------------------- |
| `mapId`          | `string`     | `''`          | Map identifier         |
| `position`       | `Position`   | `'top-right'` | Control position       |
| `controlVisible` | `boolean`    | `true`        | Control visibility     |
| `initShow`       | `boolean`    | `false`       | Show control initially |
| `drawOptions`    | `DrawOption` | `{}`          | Drawing options        |

#### Events

| Event           | Payload   | Description                   |
| --------------- | --------- | ----------------------------- |
| `draw-start`    | `string`  | Fired when drawing starts     |
| `draw-complete` | `Feature` | Fired when drawing completes  |
| `draw-update`   | `Feature` | Fired when drawing updates    |
| `draw-delete`   | `Feature` | Fired when drawing is deleted |

### InspectControl Component

#### Props

| Prop             | Type       | Default       | Description        |
| ---------------- | ---------- | ------------- | ------------------ |
| `mapId`          | `string`   | `''`          | Map identifier     |
| `position`       | `Position` | `'top-right'` | Control position   |
| `controlVisible` | `boolean`  | `true`        | Control visibility |

### DrawingType Enum

```typescript
const DrawingType = {
  POINT: 'draw_point',
  LINE_STRING: 'draw_line_string',
  POLYGON: 'draw_polygon',
};
```

### Types

```typescript
interface DrawOptions {
  displayControlsDefault?: boolean;
  controls?: {
    point?: boolean;
    line_string?: boolean;
    polygon?: boolean;
    circle?: boolean;
    rectangle?: boolean;
    trash?: boolean;
    combine_features?: boolean;
    uncombine_features?: boolean;
  };
  defaultMode?: string;
  modes?: Record<string, boolean>;
  userProperties?: boolean;
  boxSelect?: boolean;
  clickBuffer?: number;
  touchBuffer?: number;
  touchEnabled?: boolean;
  keybindings?: boolean;
  onUpdate?: boolean;
  onDelete?: boolean;
  onCombine?: boolean;
  onUncombine?: boolean;
}

interface DrawSettings extends DrawOptions {
  styles?: DrawStyle[];
  snapSettings?: SnapSettings;
  customTools?: CustomTool[];
}

interface DrawStyle {
  id: string;
  type: 'circle' | 'line' | 'fill' | 'symbol';
  paint: Record<string, any>;
  layout?: Record<string, any>;
}

interface SnapSettings {
  enabled?: boolean;
  tolerance?: number;
  snapToVertices?: boolean;
  snapToEdges?: boolean;
  snapToIntersections?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
}

interface DrawTool {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface CustomTool extends DrawTool {
  handler: (coordinates: any[]) => Feature;
}

interface Feature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: any[];
  };
  properties: Record<string, any>;
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
