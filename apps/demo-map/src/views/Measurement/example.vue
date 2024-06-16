<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { MeasurementControl } from '@hungpvq/vue-map-measurement';
import { BaseMapControl } from '@hungpvq/vue-map-basemap';
</script>
<template>
  <Map>
    <MeasurementControl position="top-left" />
    <BaseMapControl position="bottom-left" />
  </Map>
</template>

<style></style>

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
