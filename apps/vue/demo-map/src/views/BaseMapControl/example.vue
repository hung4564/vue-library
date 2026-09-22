<script setup lang="ts">
import { DevtoolsControl } from '@hungpvq/vue-map-devtools';
import DemoLanguageControl from '../../components/DemoLanguageControl.vue';
import type { MapSimple } from '@hungpvq/map-core';
import {
  BaseMapCard,
  BaseMapControl,
  BaseMapTagControl,
  Map,
} from '@hungpvq/vue-map-core';
import { MapCard } from '@hungpvq/vue-map-core/fields';
import { ref } from 'vue';
import AsideControl from '../../layout/aside-control.vue';
import DemoHelpPanel from '../../components/DemoHelpPanel.vue';
const mapId = ref('');
function onMapLoaded(map: MapSimple) {
  mapId.value = map.id;
}
</script>
<template>
  <Map @mapLoaded="onMapLoaded">
    <DevtoolsControl position="bottom-right" />
    <DemoLanguageControl />
    <AsideControl position="top-left" />
    <BaseMapControl position="bottom-left" show-opacity />
    <BaseMapTagControl position="bottom-left" />
    <div class="demo-basemap-card-panel" v-if="mapId">
      <MapCard>
        <BaseMapCard :mapId="mapId" show-opacity allow-add-basemap />
      </MapCard>
    </div>
    <DemoHelpPanel />
  </Map>
</template>

<style>
.demo-basemap-card-panel {
  position: fixed;
  top: 10px;
  right: 10px;
  width: 320px;
  z-index: 5;
}
</style>
