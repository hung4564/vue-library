<script setup lang="ts">
import {
  COOKBOOK_CHECKLIST,
  type CookbookScenarioId,
  runCookbookScenario,
} from '@hungpvq/demo-map-datasets';
import type { MapSimple } from '@hungpvq/map-core';
import { getUUIDv4 } from '@hungpvq/shared';
import { loggerFactory } from '@hungpvq/shared-log';
import { BaseMapCard, BaseMapControl, Map } from '@hungpvq/vue-map-core';
import {
  ComponentManagementControl,
  IdentifyControl,
  IdentifyShowFirstControl,
  LayerControl,
} from '@hungpvq/vue-map-dataset';
import { DevtoolsControl } from '@hungpvq/vue-map-devtools';
import { ref } from 'vue';

import DemoHelpPanel from '../../components/DemoHelpPanel.vue';
import DemoLanguageControl from '../../components/DemoLanguageControl.vue';
import { loadIdentifyDemoDatasets } from '../../data/loaders';
import AsideControl from '../../layout/aside-control.vue';

loggerFactory.enableEverything();
const mapId = ref(getUUIDv4());
const lastNote = ref('');
const done = ref<Record<string, boolean>>({});

function onMapLoaded(map: MapSimple) {
  loadIdentifyDemoDatasets(map.id);
}

async function run(id: CookbookScenarioId) {
  lastNote.value = 'running…';
  const result = await runCookbookScenario(id, mapId.value);
  done.value = { ...done.value, [id]: result.ok };
  lastNote.value = result.note ?? (result.ok ? 'ok — open Flow' : 'failed');
}
</script>

<template>
  <div class="logging-cookbook">
    <aside class="logging-cookbook__panel">
      <h2>Logging cookbook</h2>
      <p class="logging-cookbook__hint">
        Open Devtools → Logs → Flow after each run. Menu / Identify /
        LayerDetail cover scenarios 5–7 on the map.
      </p>
      <ul class="logging-cookbook__list">
        <li v-for="item in COOKBOOK_CHECKLIST" :key="item.id">
          <button type="button" @click="run(item.id)">
            {{ done[item.id] ? '✓ ' : '' }}{{ item.label }}
          </button>
          <span class="logging-cookbook__expect">{{ item.expect }}</span>
        </li>
      </ul>
      <p v-if="lastNote" class="logging-cookbook__note">{{ lastNote }}</p>
    </aside>
    <Map class="logging-cookbook__map" @mapLoaded="onMapLoaded" :mapId="mapId">
      <DevtoolsControl position="bottom-right" />
      <DemoLanguageControl />
      <AsideControl position="top-left" />
      <BaseMapControl position="bottom-left" />
      <LayerControl position="top-left" show>
        <template #endList="{ mapId: mid }">
          <BaseMapCard :mapId="mid" />
        </template>
      </LayerControl>
      <IdentifyControl position="top-right" />
      <IdentifyShowFirstControl />
      <ComponentManagementControl />
      <DemoHelpPanel />
    </Map>
  </div>
</template>

<style scoped>
.logging-cookbook {
  display: grid;
  grid-template-columns: minmax(260px, 340px) 1fr;
  height: 100%;
  min-height: 0;
}
.logging-cookbook__panel {
  padding: 12px 14px;
  overflow: auto;
  border-right: 1px solid #ddd;
  background: #fafafa;
  font-size: 13px;
}
.logging-cookbook__panel h2 {
  margin: 0 0 8px;
  font-size: 16px;
}
.logging-cookbook__hint {
  margin: 0 0 12px;
  color: #555;
  line-height: 1.4;
}
.logging-cookbook__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.logging-cookbook__list button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 6px 8px;
  cursor: pointer;
}
.logging-cookbook__expect {
  display: block;
  margin-top: 2px;
  color: #666;
  font-size: 11px;
}
.logging-cookbook__note {
  margin-top: 12px;
  padding: 8px;
  background: #fff;
  border: 1px solid #e0e0e0;
}
.logging-cookbook__map {
  min-height: 0;
  height: 100%;
}
</style>
