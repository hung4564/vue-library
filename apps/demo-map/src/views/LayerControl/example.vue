<script setup lang="ts">
import type { MapSimple } from '@hungpvq/shared-map';
import { BaseMapCard, BaseMapControl } from '@hungpvq/vue-map-basemap';
import { Map } from '@hungpvq/vue-map-core';
import { LayerControl, addLayer } from '@hungpvq/vue-map-layer';
import { ref } from 'vue';
import AsideControl from '../../layout/aside-control.vue';
import {
  createCustomActionBottomLayer,
  createCustomActionLayer,
  createCustomLegendLayer,
} from './custom';
const mapId = ref('');
function onMapLoaded(map: MapSimple) {
  mapId.value = map.id;
  const layer = createCustomLegendLayer({});
  addLayer(map.id, layer);
  addLayer(map.id, createCustomActionLayer());
  addLayer(map.id, createCustomActionBottomLayer());
}
</script>
<template>
  <Map @map-loaded="onMapLoaded">
    <AsideControl position="top-left" />
    <BaseMapControl position="bottom-left" />
    <LayerControl position="top-left">
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerControl>
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
