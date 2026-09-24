<script setup lang="ts">
import {
  applyHighlightDemoGlobalResolver,
  restoreHighlightDemoGlobalResolver,
} from '@hungpvq/demo-map-datasets';
import type { MapSimple } from '@hungpvq/map-core';
import { getUUIDv4 } from '@hungpvq/shared';
import { loggerFactory } from '@hungpvq/shared-log';
import {
  BaseMapCard,
  BaseMapControl,
  Map,
  ZoomControl,
} from '@hungpvq/vue-map-core';
import {
  ComponentManagementControl,
  IdentifyControl,
  LayerControl,
  useMapHighlight,
} from '@hungpvq/vue-map-dataset';
import { DevtoolsControl } from '@hungpvq/vue-map-devtools';
import { onMounted, onUnmounted, ref } from 'vue';

import DemoHelpPanel from '../../components/DemoHelpPanel.vue';
import DemoLanguageControl from '../../components/DemoLanguageControl.vue';
import { loadHighlightDemoDatasets } from '../../data/loaders';
import AsideControl from '../../layout/aside-control.vue';

loggerFactory.enable('map:highlight');
loggerFactory.enable('demo:highlight');
const mapId = ref(getUUIDv4());
const hl = useMapHighlight(mapId.value);

let unbindPointer: (() => void) | undefined;

onMounted(() => {
  applyHighlightDemoGlobalResolver();
  // Hover via pointer; click via IdentifyControl → HighlightResolver.
  unbindPointer = hl.bindPointer({ click: false, hover: true });
});

onUnmounted(() => {
  unbindPointer?.();
  restoreHighlightDemoGlobalResolver();
});

function onMapLoaded(map: MapSimple) {
  loadHighlightDemoDatasets(map.id);
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
    <IdentifyControl position="top-right" immediately />
    <ComponentManagementControl />
    <ZoomControl />
    <DemoHelpPanel />
  </Map>
</template>
