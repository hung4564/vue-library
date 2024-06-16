<script setup lang="ts">
import {
  BaseMapControl,
  BaseMapCard,
  BaseMapTagControl,
} from '@hungpvq/vue-map-basemap';
import { Map, MapCard } from '@hungpvq/vue-map-core';
import type { MapSimple } from '@hungpvq/shared-map';
import { ref } from 'vue';
const mapId = ref('');
function onMapLoaded(map: MapSimple) {
  mapId.value = map.id;
}
</script>
<template>
  <Map @map-loaded="onMapLoaded">
    <BaseMapControl position="bottom-left" />
    <BaseMapTagControl position="bottom-left" />
    <div class="base-map-card" v-if="mapId">
      <MapCard>
        <BaseMapCard :mapId="mapId" />
      </MapCard>
    </div>
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
.base-map-card {
  position: fixed;
  top: 10px;
  left: 10px;
  width: 300px;
  height: 90px;
  z-index: 5;
}
</style>
