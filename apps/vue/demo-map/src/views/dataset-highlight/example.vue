<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import { getUUIDv4 } from '@hungpvq/shared';
import { loggerFactory } from '@hungpvq/shared-log';
import { BaseMapCard, BaseMapControl, Map, ZoomControl } from '@hungpvq/vue-map-core';
import {
  ComponentManagementControl,
  LayerControl,
  LayerHighlight,
} from '@hungpvq/vue-map-dataset';
import { ref } from 'vue';
import AsideControl from '../../layout/aside-control.vue';
import { loadHighlightDemoDatasets } from '../../data/loaders';

loggerFactory.enable('map:highlight');
const mapId = ref(getUUIDv4());

function onMapLoaded(map: MapSimple) {
  loadHighlightDemoDatasets(map.id);
}
</script>
<template>
  <Map @map-loaded="onMapLoaded" :mapId="mapId">
    <AsideControl position="top-left" />
    <BaseMapControl position="bottom-left" />
    <LayerControl position="top-left" show>
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerControl>
    <LayerHighlight enableClick enableHover />
    <ComponentManagementControl />
    <ZoomControl />
  </Map>
</template>

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
