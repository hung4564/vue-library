# Map Draw

> Vue.js library for drawing and editing geographic objects on maps

## 🚀 Introduction

Map Draw is a Vue.js library that provides components for drawing and editing geographic objects on maps. The library supports drawing points, lines, polygons, and other complex shapes with an intuitive and easy-to-use interface.

## 📦 Installation

```bash
npm install @hungpvq/vue-map-draw
```

or

```bash
yarn add @hungpvq/vue-map-draw
```

## 🎯 Features

- ✅ **Drawing tools** – Point, line, and polygon drawing tools
- ✅ **Edit tools** – Edit existing features
- ✅ **Multiple geometries** – Support for various geometry types
- ✅ **Inspect mode** – Inspect and analyze drawn features
- ✅ **Custom styling** – Customizable drawing styles
- ✅ **Integration** – Easy integration with dataset management
- ✅ **TypeScript support** – Full TypeScript support
- ✅ **Vue 3 Composition API** – Modern Vue 3 Composition API

## 🚀 Usage

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

### Integration Example

```vue
<template>
  <Map :mapId="mapId" @map-loaded="onMapLoaded">
    <!-- Core controls -->
    <ZoomControl position="top-right" />
    <HomeControl position="top-right" />

    <!-- Draw controls -->
    <DrawControl position="top-right" :drawOptions="drawOptions" />
    <InspectControl position="top-right" />
  </Map>
</template>

<script setup lang="ts">
import { Map, ZoomControl, HomeControl } from '@hungpvq/vue-map-core';
import { DrawControl, InspectControl, DrawingType } from '@hungpvq/vue-map-draw';

const drawOptions = {
  draw_support: [DrawingType.POINT, DrawingType.LINE_STRING, DrawingType.POLYGON],
  async save(geojson) {
    // handle save
  },
};
</script>
```

---

## 💡 Best Practices & Notes

- Always provide a `draw_support` array in your `DrawOption` to specify which geometry types are enabled.
- Use the `save` method in `DrawOption` to handle saving or processing drawn features.
- The `DrawControl` is designed to be used inside a `<Map>` component from `@hungpvq/vue-map-core`.
- The `InspectControl` is useful for debugging and analyzing map layers and features, especially during development or for admin tools.
- For custom drawing tools or styles, extend the `DrawOption` and provide your own handlers and style functions.

---

## 📝 License

MIT License

---

## 🔗 Links

- **[GitHub Repository](https://github.com/hung4564/vue-library)**
- **[Documentation](/)**
- **[Issues](https://github.com/hung4564/vue-library/issues)**
