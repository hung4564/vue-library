<script setup lang="ts">
import { DevtoolsControl } from '@hungpvq/vue-map-devtools';
import DemoLanguageControl from '../../components/DemoLanguageControl.vue';
import type { MapSimple } from '@hungpvq/map-core';
import { getMap } from '@hungpvq/map-core';
import {
  DrawingType,
  getFirstFeatureByMap,
  sameFeature,
  type MapDrawOption,
} from '@hungpvq/map-draw';
import { BaseMapControl, Map } from '@hungpvq/vue-map-core';
import { DrawControl, useMapDraw } from '@hungpvq/vue-map-draw';
import { loggerFactory } from '@hungpvq/shared-log';
import type { Feature, FeatureCollection } from 'geojson';
import type { GeoJSONSource } from 'maplibre-gl';
import AsideControl from '../../layout/aside-control.vue';
import DemoHelpPanel from '../../components/DemoHelpPanel.vue';

const logger = loggerFactory.createLogger().setNamespace('demo:draw', 2);
const MAP_ID = 'draw-demo';
const RESULT_SOURCE = 'demo-draw-result';
const RESULT_LAYERS = [
  'demo-draw-result-fill',
  'demo-draw-result-line',
  'demo-draw-result-point',
] as const;

const { start } = useMapDraw(MAP_ID);
const collection: FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

function ensureResultLayers(map: MapSimple) {
  if (map.getSource(RESULT_SOURCE)) return;
  map.addSource(RESULT_SOURCE, {
    type: 'geojson',
    data: collection,
    promoteId: 'id',
  });
  map.addLayer({
    id: RESULT_LAYERS[0],
    type: 'fill',
    source: RESULT_SOURCE,
    filter: ['==', '$type', 'Polygon'],
    paint: { 'fill-color': '#3bb2d0', 'fill-opacity': 0.35 },
  });
  map.addLayer({
    id: RESULT_LAYERS[1],
    type: 'line',
    source: RESULT_SOURCE,
    filter: [
      'any',
      ['==', '$type', 'LineString'],
      ['==', '$type', 'Polygon'],
    ],
    paint: { 'line-color': '#3bb2d0', 'line-width': 2 },
  });
  map.addLayer({
    id: RESULT_LAYERS[2],
    type: 'circle',
    source: RESULT_SOURCE,
    filter: ['==', '$type', 'Point'],
    paint: {
      'circle-radius': 6,
      'circle-color': '#3bb2d0',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff',
    },
  });
}

function paintResult(mapId: string) {
  getMap(mapId, (map) => {
    ensureResultLayers(map);
    (map.getSource(RESULT_SOURCE) as GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: [...collection.features],
    });
  });
}

function upsertFeature(feature: Feature) {
  const idx = collection.features.findIndex((f) => sameFeature(f, feature));
  if (idx >= 0) collection.features[idx] = feature;
  else collection.features.push(feature);
}

function onMapLoaded(map: MapSimple) {
  ensureResultLayers(map);
  start({
    drawSupports: [
      DrawingType.POINT,
      DrawingType.LINE_STRING,
      DrawingType.POLYGON,
    ],
    cleanAfterDone: true,
    addFeature: async (feature) => {
      upsertFeature(feature);
    },
    updateFeature: async (feature) => {
      upsertFeature(feature);
    },
    deleteFeature: async (feature) => {
      collection.features = collection.features.filter(
        (f) => !sameFeature(f, feature),
      );
    },
    selectFeature: async ({ point }, { mapId }) => {
      let hit: Feature | undefined;
      getMap(mapId, (m) => {
        hit = getFirstFeatureByMap(m, point, [...RESULT_LAYERS]);
      });
      if (!hit) return undefined;
      const fromStore = collection.features.find((f) => sameFeature(f, hit!));
      return fromStore ?? hit;
    },
    redraw: (mapId) => paintResult(mapId),
    callback(result) {
      logger
        .with({ fn: 'onDrawSave', span: 'draw.save' })
        .info('draw save', result);
    },
  } satisfies MapDrawOption);
}
</script>

<template>
  <Map map-id="draw-demo" @mapLoaded="onMapLoaded">
    <DevtoolsControl position="bottom-right" />
    <DemoLanguageControl />
    <AsideControl position="top-left" />
    <DrawControl position="top-right" />
    <BaseMapControl position="bottom-left" />
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
