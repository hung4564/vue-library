# Map Legend

> Vue.js library for displaying and customizing map legends for Mapbox-based maps

## 🚀 Introduction

Map Legend is a Vue.js library that provides flexible, customizable components for displaying map legends in Mapbox-powered applications. It supports a variety of legend types, dynamic updates, and seamless integration with your map layers and styles.

## 📦 Installation

```bash
npm install @hungpvq/vue-map-legend
```

## 🎯 Features

- ✅ **Multiple legend types** – Supports symbol, gradient, and categorical legends
- ✅ **Dynamic updates** – Automatically reflects changes in map layers/styles
- ✅ **Custom legend items** – Add your own legend entries and icons
- ✅ **Legend controls** – Show/hide, expand/collapse, and position legends
- ✅ **Responsive design** – Mobile-friendly and adaptive layouts
- ✅ **TypeScript support** – Full TypeScript support
- ✅ **Vue 3 Composition API** – Modern Vue 3 Composition API

## 🚀 Usage

### Basic Legend Control

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <LegendControl position="bottom-right" />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { LegendControl } from '@hungpvq/vue-map-legend';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-legend/style.css';

function onMapLoaded(map: any) {
  console.info('Map loaded:', map);
}
</script>
```

## 🚀 Usage

### With Map Core

```vue
<template>
  <Map :mapId="mapId" @map-loaded="onMapLoaded">
    <!-- Core controls -->
    <ZoomControl position="top-right" />
    <HomeControl position="top-right" />

    <!-- Legend control -->
    <LegendControl position="bottom-right" />
  </Map>
</template>

<script setup lang="ts">
import { Map, ZoomControl, HomeControl } from '@hungpvq/vue-map-core';
import { LegendControl } from '@hungpvq/vue-map-legend';
</script>
```

### With Layer Management

```vue
<template>
  <Map :mapId="mapId" @map-loaded="onMapLoaded">
    <LayerControl position="top-left" show>
      <template #endList="{ mapId }">
        <MapLegendCard :mapId="mapId" />
      </template>
    </LayerControl>
    <LegendControl position="bottom-right" />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { LegendControl, MapLegendCard } from '@hungpvq/vue-map-legend';
import { LayerControl } from '@hungpvq/vue-map-dataset';
</script>
```

---

## 📖 License

MIT
