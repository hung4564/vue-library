<script setup lang="ts">
import { fitBounds, type MapSimple } from '@hungpvq/shared-map';
import { BaseMapCard, BaseMapControl } from '@hungpvq/vue-map-basemap';
import {
  CrsControl,
  FullScreenControl,
  GeoLocateControl,
  getMap,
  GotoControl,
  HomeControl,
  Map,
  MouseCoordinatesControl,
  SettingControl,
  ZoomControl,
} from '@hungpvq/vue-map-core';
import {
  addDataset,
  ComponentManagementControl,
  createDataset,
  createLegend,
  createMultiLegend,
  DataManagementMapboxComponent,
  DatasetComposite,
  DatasetPartListViewUiComponent,
  DatasetPartMetadataComponent,
  findSiblingOrNearestLeaf,
  GeojsonSource,
  IdentifyControl,
  IdentifyMapboxComponent,
  LayerControl,
  LayerHighlight,
  LayerInfoControl,
  LayerSimpleMapboxBuild,
  MultiMapboxLayerComponent,
  RasterUrlSource,
  setFeatureHighlight,
} from '@hungpvq/vue-map-dataset';
import { MeasurementControl } from '@hungpvq/vue-map-measurement';
import { mdiCrosshairsGps, mdiInformation } from '@mdi/js';
import { ref } from 'vue';

const mapRef = ref();

function onMapLoaded(map: MapSimple) {
  const dataset_raster = createDataset(
    'Group test',
    null,
    true
  ) as DatasetComposite;
  const source_raster = new RasterUrlSource('source', {
    name: 'raster 1',
    type: 'raster',
    tiles: [
      'https://naturalearthtiles.roblabs.com/tiles/natural_earth_cross_blended_hypso_shaded_relief.raster/{z}/{x}/{y}.png',
    ],
    maxZoom: 6,
    bounds: [
      104.96327341667353, 18.461221184685627, 106.65936430823979,
      19.549518287564368,
    ],
  });
  const layerraster = new MultiMapboxLayerComponent('layer raster', [
    {
      type: 'raster',
    },
  ]);
  const list_raster = new DatasetPartListViewUiComponent('test raster');
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
  const dataset = createDataset('Group test', null, true) as DatasetComposite;
  const source = new GeojsonSource('source', {
    type: 'FeatureCollection',
    features: [],
  });
  const groupLayer1 = createDataset(
    'Group layer 1',
    null,
    true
  ) as DatasetComposite;
  const list1 = new DatasetPartListViewUiComponent('test area');
  list1.color = '#0000FF';
  list1.opacity = 0.5;
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
  const layer1 = new MultiMapboxLayerComponent('layer area', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list1.color)
      .setOpacity(list1.opacity)
      .build(),
  ]);
  groupLayer1.add(layer1);
  groupLayer1.add(list1);
  const groupLayer2 = createDataset(
    'Group layer 2',
    null,
    true
  ) as DatasetComposite;
  const list2 = new DatasetPartListViewUiComponent('test point');
  list2.color = '#ff0000';
  list2.opacity = 0.5;
  list2.legend = createLegend('color', { text: 'color-test', color: '#fff' });
  const layer2 = new MultiMapboxLayerComponent('layer point', [
    new LayerSimpleMapboxBuild()
      .setStyleType('point')
      .setColor(list2.color)
      .setOpacity(list2.opacity)
      .build(),
  ]);
  list1.menus = [
    {
      location: 'extra',
      type: 'item',
      name: 'Fly to',
      icon: mdiCrosshairsGps,
      click: (layer, mapId) => {
        const metadata = findSiblingOrNearestLeaf(
          layer,
          (dataset) => dataset.type == 'metadata'
        ) as DatasetPartMetadataComponent;
        getMap(mapId, (map) => {
          fitBounds(map, metadata?.metadata?.bbox);
        });
      },
    },
  ];
  list2.menus = [
    {
      location: 'extra',
      type: 'item',
      name: 'Fly to',
      icon: mdiCrosshairsGps,
      click: (layer, mapId) => {
        const metadata = findSiblingOrNearestLeaf(
          layer,
          (dataset) => dataset.type == 'metadata'
        ) as DatasetPartMetadataComponent;
        getMap(mapId, (map) => {
          fitBounds(map, metadata?.metadata?.bbox);
        });
      },
    },
  ];
  const metadataForList2 = new DatasetPartMetadataComponent(
    'metadata for list2',
    {
      bbox: [
        105.88454157202995, 20.878811643339404, 106.16710803591963,
        21.0854254401454,
      ],
    }
  );
  const metadata = new DatasetPartMetadataComponent('metadata', {
    bbox: [
      104.96327341667353, 18.461221184685627, 107.53334783357559,
      20.18022781865689,
    ],
  });
  const identify = new IdentifyMapboxComponent('test identify');
  identify.menus = [
    {
      type: 'item',
      name: 'Fly to',
      icon: mdiCrosshairsGps,
      click: (layer, mapId, value) => {
        getMap(mapId, (map) => {
          fitBounds(map, value.geometry);
          const { geometry, ...properties } = value;
          setFeatureHighlight(
            mapId,
            {
              type: 'Feature',
              geometry: value.geometry,
              properties,
            },
            'identify'
          );
        });
      },
    },
    {
      type: 'item',
      name: 'Detail',
      icon: mdiInformation,
      click: (layer, mapId, value) => {
        const dataManagement = findSiblingOrNearestLeaf(
          layer,
          (dataset) => dataset.type == 'dataManagement'
        ) as DataManagementMapboxComponent;
        dataManagement?.showDetail(mapId, value);
      },
    },
  ];
  const group = { id: 'test', name: 'test' };
  list1.group = group;
  list2.group = group;
  groupLayer2.add(layer2);
  groupLayer2.add(list2);
  groupLayer2.add(metadataForList2);
  const dataManagement = new DataManagementMapboxComponent('data management', {
    fields: [
      { text: 'Name rat dai rat dai rat dai rat dai', value: 'name' },
      { text: 'Name', value: 'name' },
      { text: 'Name', value: 'name' },
      { text: 'Name', value: 'name' },
      { text: 'Name', value: 'name' },
    ],
  });
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
  addDataset(map.id, dataset);
  // addDataset(map.id, dataset_raster);

  // Example of adding a component through store
  // store?.addComponent({
  //   id: 'test-component',
  //   component: () => import('./YourComponent.vue'),
  //   attr: { /* component props */ }
  // });
}
</script>
<template>
  <Map ref="mapRef" @map-loaded="onMapLoaded">
    <ComponentManagementControl />
    <!-- <LayerInfoControl show>
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerInfoControl> -->
    <MeasurementControl position="top-right" />
    <LayerControl position="top-left" show>
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerControl>
    <IdentifyControl position="top-right" />
    <GotoControl position="top-right" />
    <CrsControl />
    <SettingControl />
    <GeoLocateControl />
    <FullScreenControl />
    <ZoomControl />
    <HomeControl />
    <MouseCoordinatesControl />
    <BaseMapControl position="bottom-left" />
    <LayerHighlight />
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
