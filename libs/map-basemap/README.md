# Getting start

## Install

```
npm i @hungpv97/vue-map-basemap
```

```
yarn add @hungpv97/vue-map-basemap
```

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Map } from '@hungpv97/vue-map-core';
import '@hungpv97/vue-map/style.css';
import { BaseMapCard, BaseMapControl } from '@hungpv97/vue-map-basemap';
import '@hungpv97/vue-map-basemap/style.css';
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
