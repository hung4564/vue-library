# Map Legend

> Vue.js library for creating and managing map legends with high customization capabilities

## 🚀 Introduction

Map Legend is a powerful Vue.js library for creating and managing map legends. The library supports various legend types, from simple legends to complex interactive and highly customizable legends.

## 📦 Installation

```bash
npm install @hungpvq/vue-map-legend
```

```bash
yarn add @hungpvq/vue-map-legend
```

## 🎯 Features

- ✅ **Multiple legend types** - Support for various legend types
- ✅ **Interactive legends** - Interactive legends
- ✅ **Customizable styling** - Customizable interface
- ✅ **Layer integration** - Integration with layers
- ✅ **Responsive design** - Responsive design
- ✅ **TypeScript support** - Full TypeScript support
- ✅ **Vue 3 Composition API** - Uses Composition API

## 🚀 Basic Usage

### Basic Legend

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <LegendControl />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { LegendControl } from '@hungpvq/vue-map-legend';

function onMapLoaded(map: any) {
  console.log('Map loaded:', map);
}
</script>
```
