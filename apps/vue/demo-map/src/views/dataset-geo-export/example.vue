<script setup lang="ts">
import DemoLanguageControl from '../../components/DemoLanguageControl.vue';
import type { MapSimple } from '@hungpvq/map-core';
import { GEO_EXPORT_DEMO_LEGEND } from '@hungpvq/demo-map-datasets';
import { getUUIDv4 } from '@hungpvq/shared';
import {
  BaseMapCard,
  BaseMapControl,
  Map,
  WorkerControl,
} from '@hungpvq/vue-map-core';
import {
  ComponentManagementControl,
  ExportGeoForm,
  HighlightPointer,
  LayerControl,
} from '@hungpvq/vue-map-dataset';
import { defineComponent, h, ref } from 'vue';
import AsideControl from '../../layout/aside-control.vue';
import { loadGeoExportDemoDatasets } from '../../data/loaders';
import DemoHelpPanel from '../../components/DemoHelpPanel.vue';

const mapId = ref(getUUIDv4());

/** Passed as dataset `formComponent` (like AT cellComponent). */
const DemoExportForm = defineComponent({
  name: 'geo-export-demo-form-component',
  inheritAttrs: false,
  setup(_, { attrs }) {
    return () =>
      h('div', { class: 'geo-export-demo-form-override' }, [
        h(
          'div',
          { class: 'geo-export-demo-form-override__banner' },
          'formComponent Â· Vue component on dataset part',
        ),
        h(ExportGeoForm, attrs),
      ]);
  },
});

/** Passed as dataset `loadingComponent`. */
const DemoExportLoading = defineComponent({
  name: 'geo-export-demo-loading-component',
  setup() {
    return () =>
      h(
        'p',
        {
          class: 'geo-export-demo-loading-override',
          role: 'status',
          'aria-live': 'polite',
        },
        'loadingComponent Â· Vue component on dataset part',
      );
  },
});

function onMapLoaded(map: MapSimple) {
  void loadGeoExportDemoDatasets(map.id, {
    formComponent: DemoExportForm,
    loadingComponent: DemoExportLoading,
  });
}
</script>
<template>
  <Map @map-loaded="onMapLoaded" :mapId="mapId">
    <DemoLanguageControl />
    <AsideControl position="top-left" />
    <BaseMapControl position="bottom-left" />
    <WorkerControl position="top-left" />
    <LayerControl position="top-left" show>
      <template #titleList>
        <pre class="geo-export-demo-legend">{{ GEO_EXPORT_DEMO_LEGEND }}</pre>
      </template>
      <template #endList="{ mapId: mid }">
        <BaseMapCard :mapId="mid" />
      </template>
    </LayerControl>
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
.geo-export-demo-legend {
  margin: 0;
  padding: 4px 0;
  font-size: 11px;
  line-height: 1.45;
  white-space: pre-wrap;
  opacity: 0.85;
  max-width: 280px;
  font-family: inherit;
}
.geo-export-demo-form-override {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  border: 2px dashed #e67e22;
  border-radius: 6px;
  overflow: hidden;
}
.geo-export-demo-form-override__banner {
  flex: 0 0 auto;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #9a3412;
  background: #fff7ed;
  border-bottom: 1px dashed #e67e22;
}
.geo-export-demo-form-override .export-geo {
  flex: 1 1 auto;
  min-height: 0;
}
.geo-export-demo-loading-override {
  margin: 0;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
}
</style>
