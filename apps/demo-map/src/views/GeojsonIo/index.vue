<script setup lang="ts">
import { BaseMapCard, BaseMapControl } from '@hungpvq/vue-map-basemap';
import { Map } from '@hungpvq/vue-map-core';
import { LayerControl } from '@hungpvq/vue-map-layer';
import AsideControl from '../../layout/aside-control.vue';
import GeojsonIoLayer from './geojsonIoLayer.vue';
</script>
<template>
  <Map>
    <AsideControl position="top-left" />
    <BaseMapControl position="bottom-left" />
    <LayerControl position="top-left" :show="true">
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerControl>
    <GeojsonIoLayer />
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
