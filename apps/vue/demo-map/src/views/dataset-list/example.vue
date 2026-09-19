<script setup lang="ts">
import { DevtoolsControl } from '@hungpvq/vue-map-devtools';
import DemoLanguageControl from '../../components/DemoLanguageControl.vue';
import type { MapSimple } from '@hungpvq/map-core';
import { getUUIDv4 } from '@hungpvq/shared';
import { loggerFactory } from '@hungpvq/shared-log';
import { BaseMapCard, BaseMapControl, Map, UniversalRegistry, WorkerControl } from '@hungpvq/vue-map-core';
import {
  ComponentManagementControl,
  LayerControl,
} from '@hungpvq/vue-map-dataset';
import { DEMO_SAMPLE_LAYER_MENU_KEY } from '@hungpvq/demo-map-datasets';
import { reactive, ref } from 'vue';
import AsideControl from '../../layout/aside-control.vue';
import { loadListDemoDatasets } from '../../data/loaders';
import SampleCustomMenu from './sample-custom-menu.vue';
import DemoHelpPanel from '../../components/DemoHelpPanel.vue';

UniversalRegistry.registerComponent(DEMO_SAMPLE_LAYER_MENU_KEY, SampleCustomMenu);
loggerFactory.enable('menu');
const mapId = ref(getUUIDv4());
const menuUi = reactive({
  role: 'admin' as 'admin' | 'viewer',
  canUsePen: true,
});

function onMapLoaded(map: MapSimple) {
  loadListDemoDatasets(map.id);
}
</script>
<template>
  <Map @mapLoaded="onMapLoaded" :mapId="mapId">
    <DevtoolsControl position="bottom-right" />
    <DemoLanguageControl />
    <AsideControl position="top-left" />
    <BaseMapControl position="bottom-left" />
    <WorkerControl position="top-left" />
    <LayerControl position="top-left" show :menu-context="menuUi">
      <template #titleList>
        <label class="menu-condition-toggle">
          <input
            type="checkbox"
            :checked="menuUi.role === 'admin'"
            @change="
              menuUi.role = ($event.target as HTMLInputElement).checked
                ? 'admin'
                : 'viewer'
            "
          />
          admin
        </label>
        <label class="menu-condition-toggle">
          <input type="checkbox" v-model="menuUi.canUsePen" />
          pen
        </label>
      </template>
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerControl>
    <ComponentManagementControl />
    <DemoHelpPanel />
  </Map>
</template>


