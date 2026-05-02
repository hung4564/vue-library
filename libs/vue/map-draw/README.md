# Map Draw

> Vue.js library for drawing and editing geographic objects on maps

## 🚀 Introduction

Map Draw is a Vue.js library that provides components for drawing and editing geographic objects on maps. The library supports drawing points, lines, polygons, and other complex shapes with an intuitive and easy-to-use interface.

## 📦 Installation

```bash
npm install @hungpvq/vue-@hungpvq/vue-map-draw
```

```bash
yarn add @hungpvq/vue-@hungpvq/vue-map-draw
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
import { DrawControl, DrawingType, type DrawOption } from '@hungpvq/vue-@hungpvq/vue-map-draw';
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
