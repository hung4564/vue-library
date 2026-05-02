# Map Basemap docs

> Vue.js library for managing and switching between different base map types

## 🚀 Introduction

Map Basemap is a Vue.js library that provides components for managing and switching between different base map types. The library supports various base map types including satellite, street, terrain, and custom maps.

## 📦 Installation

```bash
npm install @hungpvq/vue-map-basemap
```

## 🎯 Features

- ✅ **Multiple basemaps** - Support for various base map types
- ✅ **Basemap controls** - Easy switching between base maps
- ✅ **Custom basemaps** - Add your own custom base maps
- ✅ **Basemap cards** - Visual base map selection cards
- ✅ **Basemap tags** - Categorize base maps with tags
- ✅ **Compare mode** - Side-by-side base map comparison
- ✅ **Responsive design** - Mobile-friendly interface
- ✅ **TypeScript support** - Full TypeScript support
- ✅ **Vue 3 Composition API** - Modern Vue 3 Composition API

## 🚀 Usage

<!--@include: ./examples/simple.md -->
<!--@include: ./examples/custom.md -->
<!--@include: ./examples/hook.md -->

### With Map Core

```vue
<template>
  <Map :mapId="mapId" @map-loaded="onMapLoaded">
    <!-- Core controls -->
    <ZoomControl position="top-right" />
    <HomeControl position="top-right" />

    <!-- Basemap controls -->
    <BaseMapControl position="bottom-left" />
    <BaseMapTagControl position="bottom-left" />
  </Map>
</template>

<script setup lang="ts">
import { Map, ZoomControl, HomeControl } from '@hungpvq/vue-map-core';
import { BaseMapControl, BaseMapTagControl } from '@hungpvq/vue-map-core';
</script>
```

### With Dataset Management

```vue
<template>
  <Map :mapId="mapId" @map-loaded="onMapLoaded">
    <LayerControl position="top-left" show>
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerControl>
    <BaseMapControl position="bottom-left" />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { BaseMapControl, BaseMapCard } from '@hungpvq/vue-map-core';
import { LayerControl } from '@hungpvq/vue-map-dataset';
</script>
```
