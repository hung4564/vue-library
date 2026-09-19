<template>
  <Map @mapLoaded="onMapLoaded">
    <DevtoolsControl position="bottom-right" />
    <DemoLanguageControl />
    <AsideControl position="top-left" />
    <BaseMapControl position="bottom-left" />
    <LayerControl position="top-left" show />
    <DemoHelpPanel />
  </Map>
</template>

<script setup lang="ts">
import { DevtoolsControl } from '@hungpvq/vue-map-devtools';
import DemoLanguageControl from '../components/DemoLanguageControl.vue';
import type { MapSimple } from '@hungpvq/map-core';
import { BaseMapControl, Map } from '@hungpvq/vue-map-core';
import {
  LayerControl,
  useMapDataset,
} from '@hungpvq/vue-map-dataset';
import { createGeoJsonDataset } from '@hungpvq/map-dataset/geojson';
import type { FeatureCollection } from 'geojson';
import AsideControl from '../layout/aside-control.vue';
import DemoHelpPanel from '../components/DemoHelpPanel.vue';

const SAMPLE: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'District 1' },
      geometry: { type: 'Point', coordinates: [106.7009, 10.7769] },
    },
    {
      type: 'Feature',
      properties: { name: 'Ben Thanh' },
      geometry: { type: 'Point', coordinates: [106.6983, 10.7725] },
    },
  ],
};

function onMapLoaded(map: MapSimple) {
  const { addDataset } = useMapDataset(map.id);
  addDataset(
    createGeoJsonDataset({
      name: 'Sample points',
      geojson: SAMPLE,
      type: 'point',
      color: '#e74c3c',
    }),
  );
}
</script>


