<template>
  <Map ref="mapRef">
    <ToolbarControl position="top-right" />
    <GotoControl position="top-right" control-layout="toolbar" />
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
