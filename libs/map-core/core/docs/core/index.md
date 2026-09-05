# Map Core docs

> Core map functionality and components built on MapLibre GL

## 🚀 Introduction

Map Core provides the fundamental components and utilities for building interactive maps: the `Map` container, navigation controls, settings, coordinates display, fullscreen, geolocate, and more.

## 📦 Installation

### Vue

```bash
npm install @hungpvq/vue-map-core
```

### React

```bash
npm install @hungpvq/react-map-core
```

## 🎯 Features

- ✅ **Map container** - Main MapLibre GL wrapper component
- ✅ **Navigation controls** - Zoom, Home, Fullscreen, Geolocate
- ✅ **Info controls** - Mouse coordinates, Settings, map INFO panel, worker monitor, right-click context menu
- ✅ **Compare & CRS extras** - Optional extras for map compare and CRS
- ✅ **Composable hooks** - `useMap`, `useShow` and more
- ✅ **TypeScript support** - Full TypeScript types
- ✅ **Vue 3 / React** - Framework wrappers over `@hungpvq/map-core`

## Styles

Import CSS once at the app entry:

```ts
import '@hungpvq/vue-map-core/style.css';
```

```ts
import '@hungpvq/react-map-core/style.css';
```

Or import the shared core styles directly:

```ts
import '@hungpvq/map-core/style.css';
```

You only need one of the above. Prefer the framework package so it stays aligned with the wrapper you use.

## 🚀 Usage

### Vue

```vue
<template>
  <Map :mapId="mapId" @map-loaded="onMapLoaded">
    <ZoomControl position="top-right" />
    <HomeControl position="top-right" />
    <FullScreenControl position="top-right" />
    <MouseCoordinatesControl position="bottom-right" />
    <WorkerControl position="top-left" />
    <MapContextMenuControl />
  </Map>

  <!-- Optional extras -->
  <!-- <CrsControl position="bottom-right" /> -->
  <!-- <EventManagementControl position="top-right" /> -->
  <!-- <ActionControl position="top-right" /> -->
  <!-- <CompareSettingControl position="top-right" /> -->
  <!-- <MapCompare /> -->
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  Map,
  ZoomControl,
  HomeControl,
  FullScreenControl,
  MouseCoordinatesControl,
  MapContextMenuControl,
  WorkerControl,
} from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';

const mapId = ref('map-core');

function onMapLoaded(map: any) {
  console.info('Map loaded:', map);
}
</script>
```

### React

```tsx
import {
  Map,
  ZoomControl,
  HomeControl,
  FullScreenControl,
  MouseCoordinatesControl,
  MapContextMenuControl,
  WorkerControl,
} from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

function App() {
  return (
    <Map mapId="map-core" onMapLoaded={(map) => console.info('Map loaded:', map)}>
      <ZoomControl position="top-right" />
      <HomeControl position="top-right" />
      <FullScreenControl position="top-right" />
      <MouseCoordinatesControl position="bottom-right" />
      <WorkerControl position="top-left" />
      <MapContextMenuControl />
    </Map>
  );
}
```

Open / move / run controls from code: [UniversalRegistry controls](./registry-controls.md).

Demo (Vue / React): [Vue `#/registry-control`](https://hung4564.github.io/demo-map/vue/#/registry-control) · [React `#/registry-control`](https://hung4564.github.io/demo-map/react/#/registry-control).
