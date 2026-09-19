<template>
  <div class="multi-map-page">
    <div class="multi-map-page__maps">
      <div class="multi-map-page__pane">
        <h2 class="multi-map-page__label">Map A (<code>demo-map-a</code>)</h2>
        <Map map-id="demo-map-a" @mapLoaded="onLoadedA">
          <DevtoolsControl position="bottom-right" />
          <DemoLanguageControl />
          <AsideControl position="top-left" />
          <BaseMapControl position="bottom-left" />
          <LayerControl position="top-left" show />
          <DemoHelpPanel />
        </Map>
      </div>
      <div class="multi-map-page__pane">
        <h2 class="multi-map-page__label">Map B (<code>demo-map-b</code>)</h2>
        <Map map-id="demo-map-b" @mapLoaded="onLoadedB">
          <BaseMapControl position="bottom-left" />
          <LayerControl position="top-left" show />
          <DevtoolsControl position="bottom-right" />
        </Map>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DevtoolsControl } from '@hungpvq/vue-map-devtools';
import type { MapSimple } from '@hungpvq/map-core';
import { createGeoJsonDataset } from '@hungpvq/map-dataset/geojson';
import { loggerFactory } from '@hungpvq/shared-log';
import { BaseMapControl, Map } from '@hungpvq/vue-map-core';
import { LayerControl, useMapDataset } from '@hungpvq/vue-map-dataset';
import type { FeatureCollection } from 'geojson';
import AsideControl from '../layout/aside-control.vue';
import DemoHelpPanel from '../components/DemoHelpPanel.vue';
import DemoLanguageControl from '../components/DemoLanguageControl.vue';

const logger = loggerFactory.createLogger().setNamespace('demo:multi-map', 2);

const SAMPLE_A: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Map A' },
      geometry: { type: 'Point', coordinates: [106.7009, 10.7769] },
    },
  ],
};

const SAMPLE_B: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Map B' },
      geometry: { type: 'Point', coordinates: [105.8542, 21.0285] },
    },
  ],
};

function onLoadedA(map: MapSimple) {
  logger.with({ fn: 'onLoadedA', span: 'init' }).info('map A ready', {
    mapId: map.id,
  });
  const { addDataset } = useMapDataset(map.id);
  addDataset(
    createGeoJsonDataset({
      name: 'Sample A',
      geojson: SAMPLE_A,
      type: 'point',
      color: '#e74c3c',
    }),
  );
}

function onLoadedB(map: MapSimple) {
  logger.with({ fn: 'onLoadedB', span: 'init' }).info('map B ready', {
    mapId: map.id,
  });
  const { addDataset } = useMapDataset(map.id);
  addDataset(
    createGeoJsonDataset({
      name: 'Sample B',
      geojson: SAMPLE_B,
      type: 'point',
      color: '#2980b9',
    }),
  );
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

.multi-map-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.multi-map-page__maps {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

.multi-map-page__pane {
  position: relative;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.multi-map-page__label {
  flex: 0 0 auto;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  background: var(--map-surface-color, #fff);
  border-bottom: 1px solid var(--map-border-color, #eee);
}

.multi-map-page__pane :deep(.map-container),
.multi-map-page__pane :deep(.maplibregl-map) {
  flex: 1;
  min-height: 0;
  height: 100%;
}

@media (max-width: 800px) {
  .multi-map-page__maps {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
}
</style>
