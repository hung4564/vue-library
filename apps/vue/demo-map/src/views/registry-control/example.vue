<template>
    <Map :mapId="mapId">
      <AsideControl position="top-left" />
      <MeasurementControl position="top-right" />
      <ComponentManagementControl />

      <LayerControl position="top-left" show>
        <template #endList="{ mapId: mid }">
          <BaseMapCard :mapId="mid" />
        </template>
      </LayerControl>
      <DatasetControl position="top-left" />
      <EventManagementControl position="top-left" />

      <GotoControl position="top-right" />
      <InfoControl position="top-right" />
      <WorkerControl position="top-left" />
      <IdentifyControl position="top-right" />
      <DrawControl position="top-right" />
      <InspectControl position="top-right" />
      <GeoLocateControl position="top-right" />

      <PrintAdvancedControl />
      <PrintControl />
      <LegendControl />
      <CrsControl />
      <SettingControl />
      <GlobeControl />
      <FullScreenControl />
      <ZoomControl />
      <HomeControl />
      <MouseCoordinatesControl />
      <MapContextMenuControl />
      <BaseMapControl position="bottom-left" />

      <IdentifyShowFirstControl />
      <LayerHighlight />

      <RegistryControl position="top-right" show />
    </Map>
</template>

<script setup lang="ts">
import { getUUIDv4 } from '@hungpvq/shared';
import {
  BaseMapCard,
  BaseMapControl,
  CrsControl,
  EventManagementControl,
  FullScreenControl,
  GeoLocateControl,
  GlobeControl,
  GotoControl,
  HomeControl,
  InfoControl,
  LegendControl,
  Map,
  MapContextMenuControl,
  MeasurementControl,
  MouseCoordinatesControl,
  PrintAdvancedControl,
  PrintControl,
  RegistryControl,
  SettingControl,
  WorkerControl,
  ZoomControl,
} from '@hungpvq/vue-map-core';
import {
  ComponentManagementControl,
  DatasetControl,
  IdentifyControl,
  IdentifyShowFirstControl,
  LayerControl,
  LayerHighlight,
} from '@hungpvq/vue-map-dataset';
import { DrawControl, InspectControl } from '@hungpvq/vue-map-draw';
import { ref } from 'vue';
import AsideControl from '../../layout/aside-control.vue';

const mapId = ref(getUUIDv4());
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
