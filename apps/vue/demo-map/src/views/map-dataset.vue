<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import {
  BaseMapCard,
  BaseMapControl,
  CrsControl,
  EventManagementControl,
  FullScreenControl,
  GlobeControl,
  HomeControl,
  LegendControl,
  Map,
  MeasurementControl,
  MouseCoordinatesControl,
  PrintControl,
  ZoomControl,
} from '@hungpvq/vue-map-core';
import {
  ComponentManagementControl,
  DatasetControl,
  IdentifyControl,
  LayerControl,
} from '@hungpvq/vue-map-dataset';
import DemoLanguageControl from '../components/DemoLanguageControl.vue';
import DemoHelpPanel from '../components/DemoHelpPanel.vue';
import AsideControl from '../layout/aside-control.vue';
import { loadAllMapDatasets } from '../data/loaders';

/** Same as React `/map-dataset` — load all demo datasets on map ready. */
function onMapLoaded(map: MapSimple) {
  void loadAllMapDatasets(map.id);
}
</script>

<template>
  <Map @mapLoaded="onMapLoaded">
    <DemoLanguageControl />
    <AsideControl position="top-left" />
    <GlobeControl />
    <CrsControl />
    <FullScreenControl />
    <ZoomControl />
    <HomeControl />
    <MouseCoordinatesControl />
    <BaseMapControl position="bottom-left" />
    <LegendControl position="bottom-right" />
    <MeasurementControl position="bottom-right" />
    <PrintControl position="bottom-right" />
    <LayerControl position="top-left" show>
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerControl>
    <DatasetControl position="top-left" />
    <IdentifyControl position="top-right" />
    <EventManagementControl position="top-left" />
    <ComponentManagementControl />
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
