<template lang="">
  <ModuleContainer v-bind="moduleContainerProps">
    <template #draggable="props">
      <DraggableItemSideBar
        :containerId="props.containerId"
        show
        :right="true"
        disabledClose
      >
        <template #title>
          <span class="geojsonio-control-title"> JSON </span>
        </template>
        <div class="geojsonio-control-container">
          <codemirror
            v-model="geojsonStr"
            :indent-with-tab="true"
            :tab-size="2"
            :extensions="extensions"
            :style="{ height: '100%' }"
            @change="onChange"
          />
        </div>
      </DraggableItemSideBar>
    </template>
  </ModuleContainer>
</template>
<script setup lang="ts">
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { MapSimple } from '@hungpvq/shared-map';
import { DraggableItemSideBar } from '@hungpvq/vue-draggable';
import { ModuleContainer, useMap, withMapProps } from '@hungpvq/vue-map-core';
import { addLayer, GeojsonSource, removeLayer } from '@hungpvq/vue-map-layer';
import type { GeoJSON } from 'geojson';
import geojsonValidation from 'geojson-validation';
import { ref, shallowRef } from 'vue';
import { Codemirror } from 'vue-codemirror';
import { createGeojsonIOLayer } from './layer/GeojsonIOLayer';
const extensions = [json(), oneDark];
const props = defineProps({
  ...withMapProps,
});
const geojson = shallowRef<GeoJSON>({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: '1',
        name: 'feature 2',
      },
      geometry: {
        coordinates: [
          [
            [104.96327341667353, 19.549518287564368],
            [104.96327341667353, 18.461221184685627],
            [106.65936430823979, 18.461221184685627],
            [106.65936430823979, 19.549518287564368],
            [104.96327341667353, 19.549518287564368],
          ],
        ],
        type: 'Polygon',
      },
    },
  ],
});
const geojsonStr = ref<String>(JSON.stringify(geojson.value, null, 2));
const layer = shallowRef(
  createGeojsonIOLayer({
    geojson: geojson.value,
  })
);
console.log(layer.value.getView('source'));
const { callMap, moduleContainerProps } = useMap(
  props,
  (map: MapSimple) => {
    addLayer(map.id, layer.value);
  },
  (map: MapSimple) => {
    removeLayer(map.id, layer.value);
  }
);
function onChange(value: string) {
  console.log(value);
  const source = layer.value.getView('source') as GeojsonSource;
  value = JSON.parse(value);
  if (!geojsonValidation.valid(value)) {
    return;
  }
  source.setData(value);
  callMap((map) => {
    source.updateForMap(map);
  });
}
</script>
<style scoped>
.geojsonio-control-container {
  height: 100%;
}
</style>
