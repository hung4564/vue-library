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
import { DevtoolsControl } from '@hungpvq/vue-map-devtools';

import DemoHelpPanel from '../components/DemoHelpPanel.vue';
import DemoLanguageControl from '../components/DemoLanguageControl.vue';
import { loadAllMapDatasets } from '../data/loaders';
import AsideControl from '../layout/aside-control.vue';

/** Same as React `/map-dataset` — load all demo datasets on map ready. */
function onMapLoaded(map: MapSimple) {
  void loadAllMapDatasets(map.id);
}
</script>

<template>
  <Map @mapLoaded="onMapLoaded">
    <DevtoolsControl position="bottom-right" />
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
