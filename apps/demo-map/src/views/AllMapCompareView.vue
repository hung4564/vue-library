<script setup lang="ts">
import {
  CompareBaseMapCard,
  CompareBaseMapControl,
} from '@hungpvq/vue-map-basemap';
import {
  CompareSettingControl,
  CrsControl,
  FullScreenControl,
  GeoLocateControl,
  CompareSettingCard,
  GotoControl,
  HomeControl,
  MapCompare,
  MouseCoordinatesControl,
  SettingControl,
  ZoomControl,
} from '@hungpvq/vue-map-core';
import {
  addDataset,
  ComponentManagementControl,
  createDataManagementMapboxComponent,
  createDataset,
  createDatasetPartGeojsonSourceComponent,
  createDatasetPartListViewUiComponent,
  createDatasetPartMetadataComponent,
  createDatasetPartRasterSourceComponent,
  createIdentifyMapboxComponent,
  createIdentifyMapboxMergedComponent,
  createLegend,
  createMenuItemShowDetailForItem,
  createMenuItemShowDetailInfoSource,
  createMenuItemStyleEdit,
  createMenuItemToBoundActionForItem,
  createMenuItemToggleShow,
  createMultiLegend,
  createMultiMapboxLayerComponent,
  DatasetComposite,
  IdentifyControl,
  IListViewUI,
  LayerControl,
  LayerHighlight,
  LayerInfoControl,
  LayerSimpleMapboxBuild,
} from '@hungpvq/vue-map-dataset';
import { MeasurementControl } from '@hungpvq/vue-map-measurement';
import { mdiDownload, mdiPencil } from '@mdi/js';
import { ref } from 'vue';
const mapRef = ref();

function onMapLoaded(props: { id: string }) {
  const dataset_raster = createDataset(
    'Group test',
    null,
    true
  ) as DatasetComposite;
  const source_raster = createDatasetPartRasterSourceComponent('source', {
    name: 'raster 1',
    type: 'raster',
    tiles: [
      'https://naturalearthtiles.roblabs.com/tiles/natural_earth_cross_blended_hypso_shaded_relief.raster/{z}/{x}/{y}.png',
    ],
    maxzoom: 6,
    bounds: [
      104.96327341667353, 18.461221184685627, 106.65936430823979,
      19.549518287564368,
    ],
  });
  const layerraster = createMultiMapboxLayerComponent('layer raster', [
    {
      type: 'raster',
    },
  ]);
  const list_raster = createDatasetPartListViewUiComponent('test raster');
  list_raster.color = '#0000FF';
  const groupLayer_raster = createDataset(
    'Group layer 1',
    null,
    true
  ) as DatasetComposite;
  dataset_raster.add(source_raster);
  groupLayer_raster.add(list_raster);
  groupLayer_raster.add(layerraster);
  dataset_raster.add(groupLayer_raster);
  list_raster.addMenu(createMenuItemShowDetailInfoSource());
  list_raster.addMenu(createMenuItemToggleShow());
  const dataset = createDataset('Group test', null, true) as DatasetComposite;
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [],
  });
  const groupLayer1 = createDataset(
    'Group layer 1',
    null,
    true
  ) as DatasetComposite;
  const list1: IListViewUI = createDatasetPartListViewUiComponent('test area');
  list1.color = '#0000FF';
  list1.legend = createMultiLegend([
    {
      type: 'text',
      value: { text: 'text-test', value: 'test-value' },
    },
    {
      type: 'linear',
      value: {
        text: 'legend linear',
        items: [
          { value: 'test 1', color: '#fff' },
          { value: 'test 2', color: '#000' },
          { value: 'test 3', color: 'red' },
        ],
      },
    },
  ]);
  const layer1 = createMultiMapboxLayerComponent('layer area', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list1.color)
      .setOpacity(0.5)
      .build(),
  ]);
  groupLayer1.add(layer1);
  groupLayer1.add(list1);
  const groupLayer2 = createDataset(
    'Group layer 2',
    null,
    true
  ) as DatasetComposite;
  const list2 = createDatasetPartListViewUiComponent('test point');
  list2.color = '#ff0000';
  list2.legend = createLegend('color', { text: 'color-test', color: '#fff' });
  const layer2 = createMultiMapboxLayerComponent('layer point', [
    new LayerSimpleMapboxBuild()
      .setStyleType('point')
      .setColor(list2.color)
      .setOpacity(list2.opacity)
      .build(),
    new LayerSimpleMapboxBuild()
      .setStyleType('line')
      .setColor(list2.color)
      .setOpacity(0.5)
      .build(),
  ]);
  list1.addMenus([
    createMenuItemToggleShow(),
    createMenuItemShowDetailInfoSource(),
    createMenuItemStyleEdit(),
  ]);
  list2.addMenus([createMenuItemToggleShow()]);
  const metadataForList2 = createDatasetPartMetadataComponent(
    'metadata for list2',
    {
      bbox: [
        105.88454157202995, 20.878811643339404, 106.16710803591963,
        21.0854254401454,
      ],
    }
  );
  const metadata = createDatasetPartMetadataComponent('metadata', {
    bbox: [
      104.96327341667353, 18.461221184685627, 107.53334783357559,
      20.18022781865689,
    ],
  });
  const identify = createIdentifyMapboxComponent('test identify');
  const identify1 = createIdentifyMapboxMergedComponent('test identify 1');
  const identify2 = createIdentifyMapboxMergedComponent('test identify 2');
  identify.addMenus([
    createMenuItemToBoundActionForItem(),
    createMenuItemShowDetailForItem(),
  ]);
  identify1.addMenus([
    createMenuItemToBoundActionForItem(),
    createMenuItemShowDetailForItem(),
  ]);
  identify2.addMenus([
    createMenuItemToBoundActionForItem(),
    createMenuItemShowDetailForItem(),
  ]);
  const group = { id: 'test', name: 'test' };
  list1.group = group;
  groupLayer1.add(identify1);
  list2.group = group;
  groupLayer2.add(layer2);
  groupLayer2.add(list2);
  groupLayer2.add(identify2);
  groupLayer2.add(metadataForList2);
  const dataManagement = createDataManagementMapboxComponent(
    'data management',
    {
      fields: [
        { text: 'Name rat dai rat dai rat dai rat dai', value: 'name' },
        { text: 'Name', value: 'name' },
        { text: 'Name', value: 'name' },
        { text: 'Name', value: 'name' },
        { text: 'Name', value: 'name' },
      ],
    }
  );
  dataManagement.setItems([
    {
      id: '1',
      name: 'feature 1',
      geometry: {
        coordinates: [
          [
            [104.96327341667353, 19.549518287564368],
            [104.96327341667353, 18.461221184685627],
            [106.65936430823979, 18.461221184685627],
            [106.65936430823979, 19.549518287564368],
            [104.96327341667353, 19.549518287564368],
          ],
        ],
        type: 'Polygon',
      },
    },
    {
      id: '2',
      name: 'feature 2',
      geometry: {
        coordinates: [
          [
            [105.80782070639765, 20.18022781865689],
            [105.80782070639765, 18.841791883714322],
            [107.53334783357559, 18.841791883714322],
            [107.53334783357559, 20.18022781865689],
            [105.80782070639765, 20.18022781865689],
          ],
        ],
        type: 'Polygon',
      },
    },
  ]);
  dataset.add(source);
  dataset.add(dataManagement);
  dataset.add(groupLayer1);
  dataset.add(groupLayer2);
  dataset.add(identify);
  dataset.add(metadata);
  addDataset(props.id, dataset_raster);
  addDataset(props.id, dataset);
}
</script>
<template>
  <MapCompare ref="mapRef" @map-loaded="onMapLoaded">
    <ComponentManagementControl />
    <!-- <LayerInfoControl show>
      <template #endList="{ mapId }">
        <CompareBaseMapCard :mapId="mapId" />
      </template>
    </LayerInfoControl> -->
    <CompareSettingControl />
    <MeasurementControl position="top-right" />
    <LayerControl position="top-left" show>
      <template #endList="{ mapId }">
        <CompareBaseMapCard :mapId="mapId" />
        <CompareSettingCard :mapId="mapId" />
      </template>
    </LayerControl>
    <IdentifyControl position="top-right" immediately />
    <GotoControl position="top-right" />
    <CrsControl />
    <SettingControl />
    <GeoLocateControl />
    <FullScreenControl />
    <ZoomControl />
    <HomeControl />
    <MouseCoordinatesControl />
    <CompareBaseMapControl position="bottom-left" />
    <LayerHighlight />
  </MapCompare>
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
