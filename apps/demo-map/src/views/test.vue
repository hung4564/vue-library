<script setup lang="ts">
import { fitBounds, type MapSimple } from '@hungpvq/shared-map';
import { BaseMapControl } from '@hungpvq/vue-map-basemap';
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
  createDataset,
  DatasetComposite,
  DatasetPartListViewUiComponent,
  GeojsonSource,
  IdentifyControl,
  IdentifyMapboxComponent,
  LayerControl,
  MultiMapboxLayerComponent,
  RasterUrlSource,
} from '@hungpvq/vue-map-dataset';
import { LayerSimpleMapboxBuild } from '@hungpvq/vue-map-layer';
import { MeasurementControl } from '@hungpvq/vue-map-measurement';
import { mdiCrosshairsGps } from '@mdi/js';

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
    features: [
      {
        type: 'Feature',
        properties: {
          id: '1',
          name: 'feature 1',
        },
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
        type: 'Feature',
        properties: {
          id: '2',
          name: 'feature 2',
        },
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
    ],
  });
  const groupLayer1 = createDataset(
    'Group layer 1',
    null,
    true
  ) as DatasetComposite;
  const layer1 = new MultiMapboxLayerComponent('layer area', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor('#0000FF')
      .build(),
  ]);
  const list1 = new DatasetPartListViewUiComponent('test area');
  list1.color = '#0000FF';
  groupLayer1.add(layer1);
  groupLayer1.add(list1);
  const groupLayer2 = createDataset(
    'Group layer 2',
    null,
    true
  ) as DatasetComposite;
  const list2 = new DatasetPartListViewUiComponent('test point');
  list2.color = '#ff0000';
  const layer2 = new MultiMapboxLayerComponent('layer point', [
    new LayerSimpleMapboxBuild()
      .setStyleType('point')
      .setColor('#ff0000')
      .build(),
  ]);
  const identify = new IdentifyMapboxComponent('test identify');
  identify.menus = [
    {
      location: 'extra',
      type: 'item',
      name: 'Fly to',
      icon: mdiCrosshairsGps,
      click: (layer, mapId, value) => {
        console.log('test', layer, mapId, value);

        getMap(mapId, (map) => {
          fitBounds(map, value.geometry);
        });
      },
    },
  ];
  groupLayer2.add(layer2);
  groupLayer2.add(list2);
  dataset.add(source);
  dataset.add(groupLayer1);
  dataset.add(groupLayer2);
  dataset.add(identify);
  addDataset(map.id, dataset);
  addDataset(map.id, dataset_raster);
}
</script>
<template>
  <Map @map-loaded="onMapLoaded">
    <MeasurementControl position="top-right" />
    <LayerControl position="top-left" show />
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
