# Map Draw

> Vue library for drawing and editing geographic objects on maps (`@hungpvq/vue-map-draw`).

> **React:** There is no `@hungpvq/react-map-draw` package yet. Use the Vue demo for draw/inspect, or build on MapLibre draw APIs yourself. See [React demo note](https://hung4564.github.io/demo-map/react/).

## 🚀 Introduction

Map Draw provides components for drawing and editing geographic objects on maps. The library supports drawing points, lines, polygons, and other complex shapes with an intuitive and easy-to-use interface.

## 📦 Installation

### Vue

```bash
npm install @hungpvq/vue-map-draw
```

### React

Not available — draw/inspect controls ship only as `@hungpvq/vue-map-draw`.

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

### Vue — Basic Draw Control

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <DrawControl position="top-right" :drawOptions="drawOptions" />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { DrawControl, DrawingType, type DrawOption } from '@hungpvq/vue-map-draw';
import '@hungpvq/vue-map-core/style.css';

const drawOptions: DrawOption = {
  drawSupports: [DrawingType.POINT, DrawingType.LINE_STRING, DrawingType.POLYGON],
  async save(geojson: any) {
    console.info('Save drawing:', geojson);
  },
};

function onMapLoaded(map: any) {
  console.info('Map loaded:', map);
}
</script>
```

### React

Not available — `@hungpvq/react-map-draw` does not exist yet. Prefer the [Vue demo](https://hung4564.github.io/demo-map/vue/) for draw/inspect flows.

### Vue — Integration Example

```vue
<template>
  <Map :mapId="mapId" @map-loaded="onMapLoaded">
    <ZoomControl position="top-right" />
    <HomeControl position="top-right" />
    <DrawControl position="top-right" :drawOptions="drawOptions" />
    <InspectControl position="top-right" />
  </Map>
</template>

<script setup lang="ts">
import { Map, ZoomControl, HomeControl } from '@hungpvq/vue-map-core';
import { DrawControl, InspectControl, DrawingType } from '@hungpvq/vue-map-draw';

const drawOptions = {
  drawSupports: [DrawingType.POINT, DrawingType.LINE_STRING, DrawingType.POLYGON],
  async save(geojson) {
    // handle save
  },
};
</script>
```

---

## 💡 Best Practices & Notes

- Always provide a `drawSupports` array in your `DrawOption` to specify which geometry types are enabled.
- Use the `save` method in `DrawOption` to handle saving or processing drawn features.
- The `DrawControl` is designed to be used inside a `<Map>` component from `@hungpvq/vue-map-core`.
- The `InspectControl` is useful for debugging and analyzing map layers and features, especially during development or for admin tools.
- For custom drawing tools or styles, extend the `DrawOption` and provide your own handlers and style functions.

---

## 📝 License

MIT License
