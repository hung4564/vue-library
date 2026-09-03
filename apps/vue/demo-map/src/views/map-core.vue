<template>
  <Map ref="mapRef">
    <AsideControl position="top-left" />
    <GotoControl position="top-right" />
    <InfoControl position="top-right" />
    <WorkerControl position="top-left" />
    <CrsControl />
    <GlobeControl />
    <SettingControl />
    <FullScreenControl />
    <EventManagementControl />
    <ZoomControl />
    <HomeControl />
    <BaseMapControl position="bottom-left" />
    <GeoLocateControl position="top-right" />
    <MouseCoordinatesControl />
    <MapContextMenuControl />
  </Map>
</template>
<script setup lang="ts">
import { BaseMapControl } from '@hungpvq/vue-map-core';
import {
  CrsControl,
  EventManagementControl,
  FullScreenControl,
  GeoLocateControl,
  GlobeControl,
  GotoControl,
  HomeControl,
  InfoControl,
  Map,
  MapContextMenuControl,
  MouseCoordinatesControl,
  SettingControl,
  WorkerControl,
  ZoomControl,
} from '@hungpvq/vue-map-core';
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
