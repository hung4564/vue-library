<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import { getChartRandomColor } from '@hungpvq/map-core';
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
  type MeasureActionItem,
  MeasurementControl,
  type MeasurementHandleType,
  MouseCoordinatesControl,
  PrintAdvancedControl,
  PrintControl,
  SettingControl,
  ZoomControl,
} from '@hungpvq/vue-map-core';
import {
  ComponentManagementControl,
  createDatasetPartGeojsonSourceComponent,
  createDatasetPartListViewUiComponentBuilder,
  createGroupDataset,
  createMenuItemToggleShow,
  createMultiLegend,
  createMultiMapboxLayerComponent,
  createRootDataset,
  DatasetControl,
  IdentifyControl,
  IdentifyShowFirstControl,
  LayerControl,
  LayerHighlight,
  LayerSimpleMapboxBuild,
  LayerStyleType,
  useMapDataset,
} from '@hungpvq/vue-map-dataset';
import { DrawControl, InspectControl } from '@hungpvq/vue-map-draw';
import { mdiPlus } from '@mdi/js';
import { ref } from 'vue';
import AsideControl from '../layout/aside-control.vue';

const mapRef = ref();
const mapId = ref(getUUIDv4());

function onMapLoaded(map: MapSimple) {
  mapId.value = map.id;
  const { setMapId } = useMapDataset(mapId.value);
  setMapId(mapId.value);
}

const actionMeasures: MeasureActionItem[] = [
  {
    title: 'add to layer',
    icon: mdiPlus,
    type: 'add-to-layer',
    show: (ctx) => !!ctx.measurementType,
    handle: (ctx) => {
      const { addDataset } = useMapDataset(mapId.value);
      const coordinates = ctx.coordinates;
      if (!coordinates || coordinates.length < 1) {
        return;
      }
      const dataset = createDatasetMeasure(
        ctx.handler,
        ctx.measurementType || '',
      );
      addDataset(dataset);
      ctx.clear();
    },
    disabled: (ctx) => !ctx.coordinates || ctx.coordinates.length < 1,
    index: 0,
  },
];

function convertMeasureTypeToStyleType(
  measurementType: string,
): LayerStyleType {
  switch (measurementType) {
    case 'area':
      return 'area';
    case 'distance':
    case 'line':
      return 'line';
    case 'point':
      return 'point';
    default:
      return 'line';
  }
}

function createDatasetMeasure(
  handler: MeasurementHandleType,
  measurementType: string,
) {
  const result = handler.getResult();
  const dataset = createRootDataset('Dataset Measure');
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: result.features || ([] as any),
  });
  const groupLayer1 = createGroupDataset('Group layer 1');
  const list1 = createDatasetPartListViewUiComponentBuilder(
    'List Measure:' + measurementType,
  )
    .setColor(getChartRandomColor())
    .configDisabledOpacity()
    .configInitShowLegend()
    .setLegend(
      createMultiLegend([
        {
          type: 'text',
          value: {
            text: 'Measure',
            value: (result.format || result.value || 0) + '',
          },
        },
      ]),
    )
    .addMenus([createMenuItemToggleShow()])
    .build();
  const layers = [
    new LayerSimpleMapboxBuild()
      .setStyleType(convertMeasureTypeToStyleType(measurementType || 'line'))
      .setColor(list1.color)
      .build(),
  ];
  const layer1 = createMultiMapboxLayerComponent('Layer Measure', layers);
  groupLayer1.add(layer1);
  groupLayer1.add(list1);
  dataset.add(source);
  dataset.add(groupLayer1);
  return dataset;
}
</script>
<template>
  <Map ref="mapRef" @map-loaded="onMapLoaded" :mapId="mapId">
    <AsideControl position="top-left" />
    <ComponentManagementControl />
    <MeasurementControl position="top-right" :actions="actionMeasures" />
    <DrawControl position="top-right" />
    <InspectControl position="top-right" />
    <LayerControl position="top-left" show>
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerControl>
    <IdentifyControl position="top-right" />
    <PrintAdvancedControl />
    <PrintControl />
    <GotoControl position="top-right" />
    <InfoControl position="top-right" />
    <GlobeControl />
    <LegendControl />
    <CrsControl />
    <SettingControl />
    <GeoLocateControl />
    <FullScreenControl />
    <ZoomControl />
    <HomeControl />
    <MouseCoordinatesControl />
    <MapContextMenuControl />
    <BaseMapControl position="bottom-left" />
    <IdentifyShowFirstControl />
    <LayerHighlight />
    <DatasetControl position="top-left" />
    <EventManagementControl position="top-left" />
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
