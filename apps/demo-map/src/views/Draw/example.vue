<script setup lang="ts">
import { BaseMapControl } from '@hungpvq/vue-map-basemap';
import { Map } from '@hungpvq/vue-map-core';
import {
  DrawControl,
  DrawingType,
  type DrawOption,
} from '@hungpvq/vue-map-draw';
import AsideControl from '../../layout/aside-control.vue';
const drawOptions: DrawOption = {
  draw_support: [DrawingType.POINT],
  async save(geojson) {
    console.info('save', geojson);
  },
};
</script>
<template>
  <Map>
    <AsideControl position="top-left" />
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
