<template>
  <Map ref="mapRef">
    <DevtoolsControl position="bottom-right" />
    <DemoLanguageControl />
    <AsideControl position="top-left" />
    <GotoControl position="top-right" />
    <InfoControl position="top-right" />
    <WorkerControl position="top-left" />
    <CrsControl />
    <GlobeControl />
    <SettingControl />
    <ThemeControl />
    <FullScreenControl />
    <EventManagementControl />
    <ZoomControl />
    <HomeControl />
    <BaseMapControl position="bottom-left" />
    <GeoLocateControl position="top-right" />
    <MouseCoordinatesControl />
    <MapContextMenuControl />
    <DemoHelpPanel />
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
  ThemeControl,
  WorkerControl,
  ZoomControl,
} from '@hungpvq/vue-map-core';
import { DevtoolsControl } from '@hungpvq/vue-map-devtools';

import DemoHelpPanel from '../components/DemoHelpPanel.vue';
import DemoLanguageControl from '../components/DemoLanguageControl.vue';
import AsideControl from '../layout/aside-control.vue';
</script>
