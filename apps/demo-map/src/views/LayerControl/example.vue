<script setup lang="ts">
import { BaseMapControl, BaseMapCard } from '@hungpvq/vue-map-basemap';
import { Map } from '@hungpvq/vue-map-core';
import type { MapSimple } from '@hungpvq/shared-map';
import { ref } from 'vue';
import { LayerControl, addLayer } from '@hungpvq/vue-map-layer';
import { createCustomActionLayer, createCustomLegendLayer } from './custom';
const mapId = ref('');
function onMapLoaded(map: MapSimple) {
  mapId.value = map.id;
  console.log('map', map);
  const layer = createCustomLegendLayer({});
  addLayer(map.id, layer);
  addLayer(map.id, createCustomActionLayer());
}
</script>
<template>
  <Map @map-loaded="onMapLoaded">
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
