<script setup lang="ts">
import { BaseMapControl } from '@hungpv97/vue-map-basemap';
import { Map } from '@hungpv97/vue-map-core';
import {
  DrawControl,
  DrawingType,
  type DrawOption,
} from '@hungpv97/vue-map-draw';
const drawOptions: DrawOption = {
  draw_support: [DrawingType.POINT],
  async save(geojson) {
    console.log('save', geojson);
  },
};
</script>
<template>
  <Map>
    <DrawControl position="top-right" initShow :drawOptions="drawOptions" />
    <BaseMapControl position="bottom-left" />
  </Map>
</template>

<style></style>

<style>
* {
  padding: 0;
  margin: 0;
}

body,
html,
#root {
  height: 100%;
}
</style>
