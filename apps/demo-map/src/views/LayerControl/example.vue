<script setup lang="ts">
import { BaseMapControl, BaseMapCard } from '@hungpvq/vue-map-basemap';
import { Map } from '@hungpvq/vue-map-core';
import type { MapSimple } from '@hungpvq/shared-map';
import { ref } from 'vue';
import { LayerControl, addLayer } from '@hungpvq/vue-map-layer';
import { createCustomLayer } from './custom';
const mapId = ref('');
function onMapLoaded(map: MapSimple) {
  mapId.value = map.id;
  console.log('map', map);
  const layer = createCustomLayer({
    name: 'raster 1',
    tiles: [
      'https://naturalearthtiles.roblabs.com/tiles/natural_earth_cross_blended_hypso_shaded_relief.raster/{z}/{x}/{y}.png',
    ],
    bounds: [
      104.96327341667353, 18.461221184685627, 106.65936430823979,
      19.549518287564368,
    ],
  });
  addLayer(map.id, layer);
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
