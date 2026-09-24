<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import { getUUIDv4 } from '@hungpvq/shared';
import { loggerFactory } from '@hungpvq/shared-log';
import { BaseMapCard, BaseMapControl, Map } from '@hungpvq/vue-map-core';
import {
  ComponentManagementControl,
  IdentifyControl,
  LayerControl,
} from '@hungpvq/vue-map-dataset';
import { DevtoolsControl } from '@hungpvq/vue-map-devtools';
import { ref } from 'vue';

import DemoHelpPanel from '../../components/DemoHelpPanel.vue';
import DemoLanguageControl from '../../components/DemoLanguageControl.vue';
import { loadIdentifyPresentDemoDatasets } from '../../data/loaders';
import AsideControl from '../../layout/aside-control.vue';

loggerFactory.enable('map:identify');
const mapId = ref(getUUIDv4());

function onMapLoaded(map: MapSimple) {
  loadIdentifyPresentDemoDatasets(map.id);
}
</script>
<template>
  <Map @mapLoaded="onMapLoaded" :mapId="mapId">
    <DevtoolsControl position="bottom-right" />
    <DemoLanguageControl />
    <AsideControl position="top-left" />
    <BaseMapControl position="bottom-left" />
    <LayerControl position="top-left" show>
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerControl>
    <IdentifyControl position="top-right" />
    <ComponentManagementControl />
    <DemoHelpPanel />
  </Map>
</template>
