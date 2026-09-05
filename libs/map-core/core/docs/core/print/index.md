# Map Print

> Vue.js library for printing maps with customizable options

## 🚀 Introduction

Map Print is a Vue.js library that provides components for printing maps with customizable options. The library supports printing maps in different formats, custom layouts, and advanced printing options.

## 📦 Installation

Print functionality is now part of `@hungpvq/vue-map-core` / `@hungpvq/react-map-core`. No separate installation needed.

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

- ✅ **Print controls** - Easy-to-use print controls
- ✅ **Custom layouts** - Customizable print layouts
- ✅ **Multiple formats** - Support for various print formats
- ✅ **Print preview** - Preview before printing
- ✅ **Advanced options** - Advanced printing settings
- ✅ **Export support** - Export to PDF and images
- ✅ **TypeScript support** - Full TypeScript support
- ✅ **Vue 3 Composition API** - Modern Vue 3 Composition API

## 🚀 Basic Usage

### Basic Print Control

#### Vue

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <PrintControl />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { PrintControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';

function onMapLoaded(map: any) {
  console.info('Map loaded:', map);
}
</script>
```

#### React

```tsx
import { Map, PrintControl } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

function onMapLoaded(map: any) {
  console.info('Map loaded:', map);
}

<Map onMapLoaded={onMapLoaded}>
  <PrintControl />
</Map>
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
- **[Documentation](/)**
- **[Issues](https://github.com/hung4564/vue-library/issues)**
