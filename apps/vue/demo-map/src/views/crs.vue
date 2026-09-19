<template>
  <Map>
    <DevtoolsControl position="bottom-right" />
    <DemoLanguageControl />
    <AsideControl position="top-left" />
    <BaseMapControl position="bottom-left" />
    <CrsControl />
    <MouseCoordinatesControl />
    <DemoHelpPanel />
  </Map>
</template>

<script setup lang="ts">
import { DevtoolsControl } from '@hungpvq/vue-map-devtools';
import {
  BaseMapControl,
  CrsControl,
  Map,
  MouseCoordinatesControl,
} from '@hungpvq/vue-map-core';
import DemoHelpPanel from '../components/DemoHelpPanel.vue';
import DemoLanguageControl from '../components/DemoLanguageControl.vue';
import AsideControl from '../layout/aside-control.vue';
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
</style>
