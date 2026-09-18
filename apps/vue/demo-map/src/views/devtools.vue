<template>
  <Map>
    <DemoLanguageControl />
    <AsideControl position="top-left" />
    <BaseMapControl position="bottom-left" />
    <DemoHelpPanel />
  </Map>
</template>

<script setup lang="ts">
import { BaseMapControl, Map } from '@hungpvq/vue-map-core';
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
