<script setup lang="ts">
import DemoLanguageControl from '../../components/DemoLanguageControl.vue';
import type { MapSimple } from '@hungpvq/map-core';
import { getUUIDv4 } from '@hungpvq/shared';
import { loggerFactory } from '@hungpvq/shared-log';
import { BaseMapCard, BaseMapControl, Map } from '@hungpvq/vue-map-core';
import {
  ComponentManagementControl,
  HighlightPointer,
  IdentifyControl,
  LayerControl,
} from '@hungpvq/vue-map-dataset';
import { ref } from 'vue';
import { loadIdentifyPresentDemoDatasets } from '../../data/loaders';
import AsideControl from '../../layout/aside-control.vue';
import DemoHelpPanel from '../../components/DemoHelpPanel.vue';

loggerFactory.enable('map:identify');
const mapId = ref(getUUIDv4());

function onMapLoaded(map: MapSimple) {
  loadIdentifyPresentDemoDatasets(map.id);
}
</script>
<template>
  <Map @mapLoaded="onMapLoaded" :mapId="mapId">
    <DemoLanguageControl />
    <AsideControl position="top-left" />
    <BaseMapControl position="bottom-left" />
    <LayerControl position="top-left" show>
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerControl>
    <IdentifyControl position="top-right" />
    <HighlightPointer enableClick />
    <ComponentManagementControl />
    <DemoHelpPanel />
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
