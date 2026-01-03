<template>
  <Map ref="mapRef">
    <AsideControl position="top-left" />
    <ToolbarControl position="top-right" />
    <GotoControl position="top-right" control-layout="toolbar" />
    <MeasurementControl position="top-left" control-layout="toolbar" />
    <CrsControl />
    <GlobeControl />
    <SettingControl />
    <FullScreenControl />
    <EventManagementControl />
    <ZoomControl control-layout="toolbar" />
    <HomeControl control-layout="toolbar" />
    <MouseCoordinatesControl />
    <BaseMapControl position="bottom-left" />
    <GeoLocateControl position="top-right" />
    <LegendControl position="top-left" control-layout="toolbar" />
    <PrintControl position="top-left" control-layout="toolbar" />
    <PrintAdvancedControl position="top-left" control-layout="toolbar" />
  </Map>
</template>
<script setup lang="ts">
import { BaseMapControl } from '@hungpvq/vue-map-basemap';
import {
  CrsControl,
  EventManagementControl,
  FullScreenControl,
  GeoLocateControl,
  GlobeControl,
  GotoControl,
  HomeControl,
  Map,
  MouseCoordinatesControl,
  SettingControl,
  ToolbarControl,
  ZoomControl,
} from '@hungpvq/vue-map-core';
import { LegendControl } from '@hungpvq/vue-map-legend';
import { MeasurementControl } from '@hungpvq/vue-map-measurement';
import { PrintAdvancedControl, PrintControl } from '@hungpvq/vue-map-print';
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
