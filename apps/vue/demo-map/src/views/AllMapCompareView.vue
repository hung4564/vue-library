<script setup lang="ts">
import {
  CompareBaseMapCard,
  CompareBaseMapControl,
  CompareSettingCard,
  CompareSettingControl,
  CrsControl,
  FullScreenControl,
  GeoLocateControl,
  GotoControl,
  HomeControl,
  MapCompare,
  MeasurementControl,
  MouseCoordinatesControl,
  SettingControl,
  ZoomControl,
} from '@hungpvq/vue-map-core';
import {
  ComponentManagementControl,
  createDatasetPartGeojsonSourceComponent,
  createDatasetPartListViewUiComponent,
  createDatasetPartMetadataComponent,
  createDatasetPartRasterSourceComponent,
  createGroupDataset,
  createIdentifyMapboxComponent,
  createIdentifyMapboxMergedComponent,
  createLegend,
  createMenuItemShowDetailForItem,
  createMenuItemShowDetailInfoSource,
  createMenuItemStyleEdit,
  createMenuItemToBoundActionForItem,
  createMenuItemToBoundActionForList,
  createMenuItemToggleShow,
  createMultiLegend,
  createMultiMapboxLayerComponent,
  createRootDataset,
  IdentifyControl,
  LayerControl,
  LayerHighlight,
  LayerSimpleMapboxBuild,
  useMapDataset,
} from '@hungpvq/vue-map-dataset';
import { ref } from 'vue';
const mapRef = ref();

function onMapLoaded(props: { id: string }) {
  const { addDataset } = useMapDataset(props.id);
  const name = 'World Imagery';
  const bbox: [number, number, number, number] = [104.5, 18.5, 108.0, 22.5];
  const dataset_raster = createRootDataset(name);
  const source_raster = createDatasetPartRasterSourceComponent(name, {
    type: 'raster',
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    ],
    tileSize: 256,
    maxzoom: 19,
    attribution: 'Tiles © Esri',
    bounds: bbox,
  });
  const layerraster = createMultiMapboxLayerComponent(name, [
    { type: 'raster' },
  ]);
  const list_raster = createDatasetPartListViewUiComponent(name);
  list_raster.color = '#4CAF50';
  const groupLayer_raster = createGroupDataset(name);
  dataset_raster.add(createDatasetPartMetadataComponent(name, { bbox }));
  dataset_raster.add(source_raster);
  groupLayer_raster.add(list_raster);
  groupLayer_raster.add(layerraster);
  dataset_raster.add(groupLayer_raster);
  list_raster.addMenus([
    createMenuItemToggleShow({ location: 'bottom' }),
    createMenuItemShowDetailInfoSource(),
    createMenuItemToBoundActionForList({ bbox }),
  ]);
  const dataset = createRootDataset('Group test');
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: '1',
          name: 'feature 1',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [104.96327341667353, 19.549518287564368],
              [104.96327341667353, 18.461221184685627],
              [106.65936430823979, 18.461221184685627],
              [106.65936430823979, 19.549518287564368],
              [104.96327341667353, 19.549518287564368],
            ],
          ],
        },
      },
      {
        type: 'Feature',
        properties: {
          id: '2',
          name: 'feature 2',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [105.80782070639765, 20.18022781865689],
              [105.80782070639765, 18.841791883714322],
              [107.53334783357559, 18.841791883714322],
              [107.53334783357559, 20.18022781865689],
              [105.80782070639765, 20.18022781865689],
            ],
          ],
        },
      },
    ],
  });
  const groupLayer1 = createGroupDataset('Group layer 1');
  const list1 = createDatasetPartListViewUiComponent('test area');
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
  const groupLayer2 = createGroupDataset('Group layer 2');
  const list2 = createDatasetPartListViewUiComponent('test point');
  list2.color = '#ff0000';
  list2.legend = createLegend('color', { text: 'color-test', color: '#fff' });
  const layer2 = createMultiMapboxLayerComponent('layer point', [
    new LayerSimpleMapboxBuild()
      .setStyleType('point')
      .setFilter(['==', '$type', 'Point'])
      .setColor(list1.color)
      .build(),
    new LayerSimpleMapboxBuild()
      .setStyleType('line')
      .setFilter(['==', '$type', 'LineString'])
      .setColor(list1.color)
      .build(),
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setFilter(['==', '$type', 'Polygon'])
      .setOpacity(0.5)
      .setColor(list1.color)
      .build(),
  ]);
  list1.addMenus([
    createMenuItemToggleShow({ location: 'bottom' }),
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
    },
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
    createMenuItemShowDetailForItem([{ text: 'Name', value: 'name' }]),
  ]);
  identify1.addMenus([
    createMenuItemToBoundActionForItem(),
    createMenuItemShowDetailForItem([{ text: 'Name', value: 'name' }]),
  ]);
  identify2.addMenus([
    createMenuItemToBoundActionForItem(),
    createMenuItemShowDetailForItem([{ text: 'Name', value: 'name' }]),
  ]);
  const group = { id: 'test', name: 'test' };
  list1.group = group;
  groupLayer1.add(identify1);
  list2.group = group;
  groupLayer2.add(layer2);
  groupLayer2.add(list2);
  groupLayer2.add(identify2);
  groupLayer2.add(metadataForList2);
  dataset.add(source);
  dataset.add(groupLayer1);
  dataset.add(groupLayer2);
  dataset.add(identify);
  dataset.add(metadata);
  addDataset(dataset_raster);
  addDataset(dataset);
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
