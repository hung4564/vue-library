# Map Legend

> Vue.js library for displaying and customizing map legends for Mapbox-based maps

## 🚀 Introduction

Map Legend is a Vue.js library that provides flexible, customizable components for displaying map legends in Mapbox-powered applications. It supports a variety of legend types, dynamic updates, and seamless integration with your map layers and styles.

## 📦 Installation

Legend functionality is now part of `@hungpvq/vue-map-core` / `@hungpvq/react-map-core`. No separate installation needed.

### Vue

```bash
npm install @hungpvq/vue-map-core
```

```bash
yarn add @hungpvq/vue-map-core
```

### React

```bash
npm install @hungpvq/react-map-core
```

```bash
yarn add @hungpvq/react-map-core
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

#### Vue

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <LegendControl position="bottom-right" />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { LegendControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';

function onMapLoaded(map: any) {
  console.info('Map loaded:', map);
}
</script>
```

#### React

```tsx
import { Map, LegendControl } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

function onMapLoaded(map: any) {
  console.info('Map loaded:', map);
}

<Map onMapLoaded={onMapLoaded}>
  <LegendControl position="bottom-right" />
</Map>
```

## 🚀 Usage

### With Map Core

#### Vue

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
import { LegendControl } from '@hungpvq/vue-map-core';
</script>
```

#### React

```tsx
import { Map, ZoomControl, HomeControl, LegendControl } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

<Map mapId={mapId} onMapLoaded={onMapLoaded}>
  <ZoomControl position="top-right" />
  <HomeControl position="top-right" />
  <LegendControl position="bottom-right" />
</Map>
```

### With Layer Management

#### Vue

```vue
<template>
  <Map :mapId="mapId" @map-loaded="onMapLoaded">
    <LayerControl position="top-left" show>
      <template #endList="{ mapId }">
        <!-- MapLegendCard is not available, use LegendControl instead -->
      </template>
    </LayerControl>
    <LegendControl position="bottom-right" />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { LegendControl } from '@hungpvq/vue-map-core';
import { LayerControl } from '@hungpvq/vue-map-dataset';
</script>
```

#### React

```tsx
import { Map, LegendControl } from '@hungpvq/react-map-core';
import { LayerControl } from '@hungpvq/react-map-dataset';
import '@hungpvq/react-map-core/style.css';
import '@hungpvq/react-map-dataset/style.css';

<Map mapId={mapId} onMapLoaded={onMapLoaded}>
  <LayerControl
    position="top-left"
    show
    endList={({ mapId }) => null}
  />
  <LegendControl position="bottom-right" />
</Map>
```

---

## 📖 License

MIT
