<template>
  <Map ref="mapRef">
    <DevtoolsControl position="bottom-right" />
    <DemoLanguageControl />
    <AsideControl position="top-left" />
    <ToolbarControl position="top-right" />
    <GotoControl position="top-right" control-layout="toolbar" />
    <MeasurementControl position="top-left" />
    <CrsControl />
    <GlobeControl />
    <SettingControl />
    <FullScreenControl />
    <EventManagementControl />
    <ZoomControl control-layout="toolbar" control-order="99" />
    <HomeControl control-layout="toolbar" />
    <MouseCoordinatesControl />
    <BaseMapControl position="bottom-left" />
    <GeoLocateControl position="top-right" />
    <LegendControl
      position="top-left"
      control-layout="toolbar"
      control-order="5"
    />
    <PrintControl position="top-left" control-layout="toolbar" />
    <PrintAdvancedControl position="top-left" control-layout="toolbar" />
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
  Map,
  MouseCoordinatesControl,
  SettingControl,
  ToolbarControl,
  ZoomControl,
} from '@hungpvq/vue-map-core';
import { LegendControl } from '@hungpvq/vue-map-core';
import { MeasurementControl } from '@hungpvq/vue-map-core';
import { PrintAdvancedControl, PrintControl } from '@hungpvq/vue-map-core';
import { DevtoolsControl } from '@hungpvq/vue-map-devtools';

import DemoHelpPanel from '../components/DemoHelpPanel.vue';
import DemoLanguageControl from '../components/DemoLanguageControl.vue';
import AsideControl from '../layout/aside-control.vue';
</script>
