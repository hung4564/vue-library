<template>
  <Map
    map-id="basemap-error-demo"
    :init-options="initOptions"
    @error="onMapError"
  >
    <DemoLanguageControl />
    <AsideControl position="top-left" />
    <DemoHelpPanel />
    <div class="basemap-error-note" role="status">
      This map loads an invalid style URL so MapLibre / init failures flow through
      <code>errorHandler</code> → <code>MapErrorToast</code> (bottom center).
    </div>
  </Map>
</template>

<script setup lang="ts">
import { loggerFactory } from '@hungpvq/shared-log';
import { Map } from '@hungpvq/vue-map-core';
import AsideControl from '../layout/aside-control.vue';
import DemoHelpPanel from '../components/DemoHelpPanel.vue';
import DemoLanguageControl from '../components/DemoLanguageControl.vue';

const logger = loggerFactory.createLogger().setNamespace('demo:basemap-error', 2);

const initOptions = {
  attributionControl: false,
  style: 'https://invalid.example.invalid/styles/missing.json',
  center: [106.7, 10.78] as [number, number],
  zoom: 10,
};

function onMapError(error: Error) {
  logger.info('map error (also toasted via errorHandler)', {
    message: error.message,
  });
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

.basemap-error-note {
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  max-width: min(480px, calc(100vw - 24px));
  padding: 8px 12px;
  background: var(--map-surface-color, #fff);
  border: 1px solid var(--map-border-color, #ddd);
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.4;
}
</style>
