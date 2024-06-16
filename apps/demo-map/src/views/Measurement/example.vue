<script setup lang="ts">
import { Map } from '@hungpv97/vue-map-core';
import { MeasurementControl } from '@hungpv97/vue-map-measurement';
import { BaseMapControl } from '@hungpv97/vue-map-basemap';
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
