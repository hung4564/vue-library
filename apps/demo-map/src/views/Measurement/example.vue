<script setup lang="ts">
import { BaseMapControl } from '@hungpvq/vue-map-basemap';
import { Map } from '@hungpvq/vue-map-core';
import {
  MeasureActionItem,
  MeasurementControl,
} from '@hungpvq/vue-map-measurement';
import { mdiPlus } from '@mdi/js';
import AsideControl from '../../layout/aside-control.vue';
const actions: MeasureActionItem[] = [
  {
    title: 'add to layer',
    icon: mdiPlus,
    type: 'add-to-layer',
    handle: (data) => {
      console.info('add to layer', data);
    },
    disabled: (ctx) => !ctx.coordinates || ctx.coordinates.length < 1,
    index: 0,
  },
];
</script>
<template>
  <Map>
    <AsideControl position="top-left" />
    <MeasurementControl position="top-left" :actions="actions" />
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
