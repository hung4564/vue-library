# Getting start

## Install

```
npm i @hungpvq/vue-map-basemap
```

```
yarn add @hungpvq/vue-map-basemap
```

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Map } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map/style.css';
import { BaseMapCard, BaseMapControl } from '@hungpvq/vue-map-basemap';
import '@hungpvq/vue-map-basemap/style.css';
const mapId = ref('');
function onMapLoaded(map: MapSimple) {
  mapId.value = map.id;
}
</script>

<template>
  <Map @map-loaded="onMapLoaded">
    <BaseMapControl />
  </Map>
  <BaseMapCard :mapId="mapId" />
</template>
```

## Component

<!--@include: ./src/modules/BaseMapControl.md -->
<!--@include: ./src/modules/BaseMapTagControl.md -->
<!--@include: ./src/modules/BaseMapCard.md -->
