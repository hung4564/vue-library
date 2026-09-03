# Map Core docs

> Core map functionality and components built on MapLibre GL

## 🚀 Introduction

Map Core provides the fundamental components and utilities for building interactive maps: the `Map` container, navigation controls, settings, coordinates display, fullscreen, geolocate, and more.

## 📦 Installation

```bash
npm install @hungpvq/vue-map-core
```

## 🎯 Features

- ✅ **Map container** - Main MapLibre GL wrapper component
- ✅ **Navigation controls** - Zoom, Home, Fullscreen, Geolocate
- ✅ **Info controls** - Mouse coordinates, Settings, map INFO panel, right-click context menu
- ✅ **Compare & CRS extras** - Optional extras for map compare and CRS
- ✅ **Composable hooks** - `useMap`, `useShow` and more
- ✅ **TypeScript support** - Full TypeScript types
- ✅ **Vue 3 Composition API**

## 🚀 Usage

```vue
<template>
  <Map :mapId="mapId" @map-loaded="onMapLoaded">
    <ZoomControl position="top-right" />
    <HomeControl position="top-right" />
    <FullScreenControl position="top-right" />
    <MouseCoordinatesControl position="bottom-right" />
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
import { Map, ZoomControl, HomeControl, FullScreenControl, MouseCoordinatesControl, MapContextMenuControl } from '@hungpvq/vue-map-core';

const mapId = ref('map-core');

function onMapLoaded(map: any) {
  console.info('Map loaded:', map);
}
</script>
```

Open / move / run controls from code: [UniversalRegistry controls](./registry-controls.md).

Demo (Vue / React demo-map): route `#/registry-control`.

<!--@include: ../default.md -->
