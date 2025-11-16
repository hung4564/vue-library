# Map Core

> Core Vue.js library for creating and managing interactive maps with MapLibre GL

## 🚀 Introduction

Map Core is the foundational Vue.js library for creating and managing interactive maps. The library provides essential components like Map, various controls, and utilities for building map applications with Vue.js and MapLibre GL.

## 📦 Installation

```bash
npm install @hungpvq/vue-map-core
```

```bash
yarn add @hungpvq/vue-map-core
```

## 🎯 Features

- ✅ **Map component** - Core map component with MapLibre GL
- ✅ **Navigation controls** - Zoom, home, fullscreen, geolocation controls
- ✅ **Information controls** - Mouse coordinates, settings, CRS controls
- ✅ **Event management** - Comprehensive event handling system
- ✅ **TypeScript support** - Full TypeScript support
- ✅ **Vue 3 Composition API** - Modern Vue 3 Composition API
- ✅ **CRS support** - Coordinate reference system support
- ✅ **Language support** - Multi-language support

## 🚀 Basic Usage

### Basic Map Component

```vue
<template>
  <Map :mapId="mapId" @map-loaded="onMapLoaded">
    <!-- Navigation controls -->
    <ZoomControl position="top-right" />
    <HomeControl position="top-right" />
    <FullScreenControl position="top-right" />

    <!-- Information controls -->
    <MouseCoordinatesControl position="bottom-left" />
  </Map>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getUUIDv4 } from '@hungpvq/shared';
import { Map, ZoomControl, HomeControl, FullScreenControl, MouseCoordinatesControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';

const mapId = ref(getUUIDv4());

function onMapLoaded(map: any) {
  console.info('Map loaded:', map);
}
</script>
```

### Map with All Controls

```vue
<template>
  <Map :mapId="mapId" @map-loaded="onMapLoaded">
    <!-- Navigation controls -->
    <ZoomControl position="top-right" />
    <HomeControl position="top-right" />
    <FullScreenControl position="top-right" />

    <!-- Location controls -->
    <GeoLocateControl position="top-right" />
    <GotoControl position="top-right" />

    <!-- Information controls -->
    <MouseCoordinatesControl position="bottom-left" />
    <SettingControl position="top-right" />

    <!-- Coordinate system -->
    <CrsControl position="bottom-right" />

    <!-- Additional Controls -->
    <GlobeControl position="top-right" />
  </Map>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getUUIDv4 } from '@hungpvq/shared';
import { Map, ZoomControl, HomeControl, FullScreenControl, GeoLocateControl, GotoControl, MouseCoordinatesControl, SettingControl, CrsControl, GlobeControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';

const mapId = ref(getUUIDv4());

function onMapLoaded(map: any) {
  console.info('Map loaded:', map);
}
</script>
```

## 📚 API Reference

### Map Component

#### Props

| Prop                | Type         | Default                                             | Description                        |
| ------------------- | ------------ | --------------------------------------------------- | ---------------------------------- |
| `mapboxAccessToken` | `string`     | `''`                                                | Mapbox access token                |
| `initOptions`       | `MapOptions` | `{ attributionControl: false, zoomControl: false }` | MapLibre GL initialization options |
| `dragId`            | `string`     | `undefined`                                         | ID of draggable element            |
| `mapId`             | `string`     | `undefined`                                         | Unique map identifier              |

#### Events

| Event         | Payload     | Description                 |
| ------------- | ----------- | --------------------------- |
| `map-loaded`  | `MapSimple` | Fired when map is loaded    |
| `map-destroy` | `MapSimple` | Fired when map is destroyed |

#### Slots

| Slot      | Description              |
| --------- | ------------------------ |
| `default` | Map controls and content |

### Map Controls

All map controls support the following common props:

| Prop             | Type                                                           | Default       | Description        |
| ---------------- | -------------------------------------------------------------- | ------------- | ------------------ |
| `mapId`          | `string`                                                       | `''`          | Map identifier     |
| `position`       | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'top-right'` | Control position   |
| `controlVisible` | `boolean`                                                      | `true`        | Control visibility |
| `order`          | `number`                                                       | `0`           | Control order      |

### Available Controls

- **ZoomControl** - Zoom in/out buttons
- **HomeControl** - Reset to home position
- **FullScreenControl** - Toggle fullscreen mode
- **GeoLocateControl** - Get user location
- **GotoControl** - Navigate to coordinates
- **MouseCoordinatesControl** - Display mouse coordinates
- **SettingControl** - Map settings panel
- **CrsControl** - Coordinate reference system selector
- **GlobeControl** - Toggle globe view

### Types

```typescript
// MapLibre GL MapOptions (partial)
interface MapOptions {
  center?: [number, number];
  zoom?: number;
  style?: string | StyleSpecification;
  pitch?: number;
  bearing?: number;
  antialias?: boolean;
  preserveDrawingBuffer?: boolean;
  maxZoom?: number;
  minZoom?: number;
  maxBounds?: [[number, number], [number, number]];
  container?: string | HTMLElement;
  interactive?: boolean;
  scrollZoom?: boolean | { around?: 'center' | 'cursor' };
  boxZoom?: boolean;
  dragRotate?: boolean;
  dragPan?: boolean;
  keyboard?: boolean;
  doubleClickZoom?: boolean;
  touchZoomRotate?: boolean;
  touchPitch?: boolean;
  trackResize?: boolean;
  renderWorldCopies?: boolean;
  attributionControl?: boolean;
  logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  hash?: boolean | string;
  locale?: { [key: string]: string };
  optimizeForTerrain?: boolean;
  pixelRatio?: number;
  preferWebGL2?: boolean;
  projection?: any;
  repaint?: boolean;
  skyLayer?: any;
  terrain?: any;
  testMode?: boolean;
  transformRequest?: (url: string, resourceType: string) => any;
  workerCount?: number;
  workerClass?: any;
  workerUrl?: string;
}

// Map control position type
type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

// Map control props interface
interface WithMapPropType {
  mapId?: string;
  dragId?: string;
  btnWidth?: number;
  position?: Position;
  controlVisible?: boolean;
  order?: number;
}
```

## 🔧 Advanced Usage

### Map with Custom Initialization

```vue
<template>
  <Map :mapId="mapId" :initOptions="initOptions" @map-loaded="onMapLoaded">
    <ZoomControl position="top-right" />
    <HomeControl position="top-right" />
    <FullScreenControl position="top-right" />
    <MouseCoordinatesControl position="bottom-left" />
  </Map>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Map, ZoomControl, HomeControl, FullScreenControl, MouseCoordinatesControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';

const mapId = ref('custom-map');

const initOptions = ref({
  center: [105.8342, 21.0285], // Hanoi coordinates
  zoom: 10,
  maxZoom: 22,
  minZoom: 1,
  attributionControl: false,
  zoomControl: false,
});

function onMapLoaded(map: any) {
  console.info('Map loaded:', map);

  // Add custom event listeners
  map.on('click', (e: any) => {
    console.info('Map clicked:', e.lngLat);
  });

  map.on('move', () => {
    console.info('Map moved:', map.getCenter());
  });
}
</script>
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
