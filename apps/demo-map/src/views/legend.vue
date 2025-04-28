<template lang="">
  <Map ref="mapRef" @map-loaded="onMapLoaded">
    <GotoControl position="top-right" />
    <GlobeControl />
    <SettingControl />
    <FullScreenControl />
    <ZoomControl />
    <HomeControl />
    <MouseCoordinatesControl />
    <BaseMapControl position="bottom-left" />
    <div class="legend-control">
      <component
        :is="legendVNode"
        v-for="(legendVNode, index) in legends"
        :key="index"
      />
    </div>
  </Map>
</template>
<script setup lang="ts">
import { MapSimple } from '@hungpvq/shared-map';
import { BaseMapControl } from '@hungpvq/vue-map-basemap';
import {
  FullScreenControl,
  GlobeControl,
  GotoControl,
  HomeControl,
  Map,
  MouseCoordinatesControl,
  SettingControl,
  ZoomControl,
} from '@hungpvq/vue-map-core';
import { LayerSimpleMapboxBuild } from '@hungpvq/vue-map-dataset';
import { useLayerLegend } from '@hungpvq/vue-map-legend';
import { shallowRef } from 'vue';
const { getLayerLegendVNode } = useLayerLegend();
const legends = shallowRef<any[]>([]);
function onMapLoaded(map: MapSimple) {
  const layers: any[] = [
    {
      id: 'my-line-layer',
      type: 'line',
      source: 'my-line-source',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#ff0000', // màu đỏ
        'line-width': 4,
      },
    },
    {
      id: 'points-symbol',
      type: 'symbol',
      source: 'points',
      layout: {
        'icon-image': 'aerialway_11', // Biểu tượng mặc định của Mapbox
        'icon-size': 1.5,
        'text-field': ['get', 'title'],
        'text-offset': [0, 1.2],
        'text-anchor': 'top',
      },
      paint: {
        'text-color': '#333',
      },
    },
    {
      id: 'text-labels',
      type: 'symbol',
      source: 'labels',
      layout: {
        'text-field': ['get', 'name'], // Lấy text từ thuộc tính 'name'
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 14,
        'text-offset': [0, 0.5],
        'text-anchor': 'top',
      },
      paint: {
        'text-color': '#ff0000',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2,
      },
    },
    new LayerSimpleMapboxBuild().setStyleType('point').build(),
    new LayerSimpleMapboxBuild().setStyleType('line').build(),
    new LayerSimpleMapboxBuild().setStyleType('area').build(),
  ];
  legends.value = layers.map((layer) => getLayerLegendVNode(map, layer));
}
</script>
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
.legend-control {
  position: fixed;
  top: 10px;
  left: 10px;
  width: 400px;
  z-index: 999;
  background: white;
  padding: 8px;
}
</style>
