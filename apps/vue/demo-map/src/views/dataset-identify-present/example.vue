<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import { getUUIDv4 } from '@hungpvq/shared';
import { loggerFactory } from '@hungpvq/shared-log';
import { BaseMapCard, BaseMapControl, Map } from '@hungpvq/vue-map-core';
import {
  ComponentManagementControl,
  IdentifyControl,
  LayerControl,
  LayerHighlight,
} from '@hungpvq/vue-map-dataset';
import { ref } from 'vue';
import { loadIdentifyPresentDemoDatasets } from '../../data/loaders';
import AsideControl from '../../layout/aside-control.vue';

loggerFactory.enable('map:identify');
const mapId = ref(getUUIDv4());

function onMapLoaded(map: MapSimple) {
  loadIdentifyPresentDemoDatasets(map.id);
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
    <IdentifyControl position="top-right" />
    <LayerHighlight />
    <ComponentManagementControl />
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
