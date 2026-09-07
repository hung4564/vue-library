<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import { LIST_VIEW_MENU_COMPONENT_KEY } from '@hungpvq/map-dataset';
import { DEMO_LAYER_TOGGLE_SHOW_KEY } from '@hungpvq/demo-map-datasets';
import { getUUIDv4 } from '@hungpvq/shared';
import { loggerFactory } from '@hungpvq/shared-log';
import {
  BaseMapCard,
  BaseMapControl,
  Map,
  UniversalRegistry,
} from '@hungpvq/vue-map-core';
import {
  ComponentManagementControl,
  LayerControl,
  LayerHighlight,
} from '@hungpvq/vue-map-dataset';
import { ref } from 'vue';
import { loadMenuDemoDatasets } from '../../data/loaders';
import AsideControl from '../../layout/aside-control.vue';
import SampleLayerToggleShow from './sample-layer-toggle-show.vue';
import SampleToggleShowButton from './sample-toggle-show-button.vue';

loggerFactory.enable('menu');
const mapId = ref(getUUIDv4());

function registerDemoToggleComponents(id: string) {
  /**
   * Map-wide button UI: ON/OFF via toggleShowButton.
   * Per-layer: register a full ToggleShow (logic+UI) and override menu componentKey.
   * Register on map load so entries survive map remount / removeMap.
   */
  UniversalRegistry.registerComponentForMap(
    id,
    LIST_VIEW_MENU_COMPONENT_KEY.toggleShowButton,
    SampleToggleShowButton,
  );
  UniversalRegistry.registerComponentForMap(
    id,
    DEMO_LAYER_TOGGLE_SHOW_KEY,
    SampleLayerToggleShow,
  );
}

function onMapLoaded(map: MapSimple) {
  registerDemoToggleComponents(map.id);
  loadMenuDemoDatasets(map.id);
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
    <LayerHighlight enableClick />
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
