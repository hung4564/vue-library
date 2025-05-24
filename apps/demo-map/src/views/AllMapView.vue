<script setup lang="ts">
import {
  useConvertToGeoJSON,
  useDownloadFile,
  useGeoConvertToFile,
} from '@hungpvq/shared-file';
import { loggerFactory } from '@hungpvq/shared-log';
import { type MapSimple } from '@hungpvq/shared-map';
import { BaseMapCard, BaseMapControl } from '@hungpvq/vue-map-basemap';
import {
  CrsControl,
  FullScreenControl,
  GeoLocateControl,
  getMap,
  GlobeControl,
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
  createDataManagementMapboxComponent,
  createDataset,
  createDatasetPartGeojsonSourceComponent,
  createDatasetPartListViewUiComponent,
  createDatasetPartMetadataComponent,
  createDatasetPartRasterSourceComponent,
  createIdentifyMapboxComponent,
  createIdentifyMapboxMergedComponent,
  createLegend,
  createMenuItem,
  createMenuItemShowDetailForItem,
  createMenuItemShowDetailInfoSource,
  createMenuItemStyleEdit,
  createMenuItemToBoundActionForItem,
  createMenuItemToBoundActionForList,
  createMenuItemToggleShow,
  createMultiLegend,
  createMultiMapboxLayerComponent,
  DatasetComposite,
  findSiblingOrNearestLeaf,
  IdentifyControl,
  IdentifyShowFirstControl,
  IListViewUI,
  isDataManagementView,
  isDatasetMap,
  LayerControl,
  LayerHighlight,
  LayerSimpleMapboxBuild,
} from '@hungpvq/vue-map-dataset';
import {
  callDraw,
  DrawControl,
  DrawingType,
  InspectControl,
} from '@hungpvq/vue-map-draw';
import { LegendControl } from '@hungpvq/vue-map-legend';
import { MeasurementControl } from '@hungpvq/vue-map-measurement';
import { PrintAdvancedControl, PrintControl } from '@hungpvq/vue-map-print';
import { mdiDownload, mdiPencil } from '@mdi/js';
import { ref } from 'vue';
const { downloadFile } = useDownloadFile();
const mapRef = ref();

const { convertList } = useConvertToGeoJSON();
const { convert } = useGeoConvertToFile();
function onMapLoaded(map: MapSimple) {
  const dataset_raster = createDataset(
    'Group test',
    null,
    true,
  ) as DatasetComposite;
  const source_raster = createDatasetPartRasterSourceComponent('source', {
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
    true,
  ) as DatasetComposite;
  dataset_raster.add(source_raster);
  groupLayer_raster.add(list_raster);
  groupLayer_raster.add(layerraster);
  dataset_raster.add(groupLayer_raster);
  list_raster.addMenu(createMenuItemShowDetailInfoSource());
  const dataset = createDataset('Group test', null, true) as DatasetComposite;
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [],
  });
  const groupLayer1 = createDataset(
    'Group layer 1',
    null,
    true,
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
    true,
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
    createMenuItemToggleShow({ location: 'extra' }),
    createMenuItemToBoundActionForList(),
    createMenuItemShowDetailInfoSource(),
    createMenuItemStyleEdit(),
  ]);
  list2.addMenus([
    createMenuItemToggleShow({ location: 'extra' }),
    createMenuItemToBoundActionForList(),
    createMenuDrawLayer(),
    createMenuDownload(),
  ]);
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
    },
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
  addDataset(map.id, dataset);
  addDataset(map.id, createDatasetPoint());
  // addDataset(map.id, dataset_raster);
}
function createDatasetPoint() {
  const dataset = createDataset('Group test', null, true) as DatasetComposite;
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [],
  });
  const groupLayer1 = createDataset(
    'Group layer 1',
    null,
    true,
  ) as DatasetComposite;
  const list1: IListViewUI = createDatasetPartListViewUiComponent('test point');
  const layer1 = createMultiMapboxLayerComponent('layer area', [
    new LayerSimpleMapboxBuild()
      .setStyleType('point')
      .setColor(list1.color)
      .build(),
  ]);
  groupLayer1.add(layer1);
  groupLayer1.add(list1);
  list1.addMenus([
    createMenuItemToggleShow({ location: 'extra' }),
    createMenuItemToBoundActionForList(),
    createMenuItemShowDetailInfoSource(),
    createMenuItemStyleEdit(),
  ]);
  const dataManagement = createDataManagementMapboxComponent(
    'data management',
    {
      fields: [{ text: 'Name', value: 'name' }],
    },
  );
  dataManagement.setItems([
    {
      id: '2',
      name: 'feature 2',
      geometry: {
        coordinates: [106.26447460804093, 20.9143362367018],
        type: 'Point',
      },
    },
  ]);
  dataset.add(source);
  dataset.add(dataManagement);
  dataset.add(groupLayer1);
  return dataset;
}
function createMenuDownload() {
  return createMenuItem({
    type: 'item',
    name: 'Download',
    icon: mdiDownload,
    click: async (layer, mapId) => {
      const maybeDataManagement = findSiblingOrNearestLeaf(
        layer,
        (dataset) => dataset.type === 'dataManagement',
      );

      if (isDataManagementView(maybeDataManagement)) {
        const data = await convert(
          convertList((await maybeDataManagement.getList()) || []),
          {
            filename: 'download.geojson',
          },
        );
        if (data) downloadFile(data, 'download.geojson');
      }
    },
  });
}
function createMenuDrawLayer() {
  return createMenuItem({
    type: 'item',
    name: 'Edit feature',
    icon: mdiPencil,
    click: (layer, mapId) => {
      const maybeDataManagement = findSiblingOrNearestLeaf(
        layer,
        (dataset) => dataset.type === 'dataManagement',
      );
      if (isDataManagementView(maybeDataManagement)) {
        callDraw(mapId, {
          cleanAfterDone: true,
          draw_support: [
            DrawingType.POINT,
            DrawingType.POLYGON,
            DrawingType.LINE_STRING,
          ],
          getFeatures:
            maybeDataManagement.getFeatures &&
            maybeDataManagement.getFeatures.bind(maybeDataManagement),
          addFeatures:
            maybeDataManagement.addFeatures &&
            maybeDataManagement.addFeatures.bind(maybeDataManagement),
          updateFeatures:
            maybeDataManagement.updateFeatures &&
            maybeDataManagement.updateFeatures.bind(maybeDataManagement),
          deleteFeatures:
            maybeDataManagement.deleteFeatures &&
            maybeDataManagement.deleteFeatures.bind(maybeDataManagement),
          reset: async () => {
            getMap(mapId, (map) => {
              if (isDatasetMap(maybeDataManagement))
                maybeDataManagement.addToMap(map);
            });
          },
        });
      }
    },
  });
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
    <GlobeControl />
    <LegendControl />
    <CrsControl />
    <SettingControl />
    <GeoLocateControl />
    <FullScreenControl />
    <ZoomControl />
    <HomeControl />
    <MouseCoordinatesControl />
    <BaseMapControl position="bottom-left" />
    <IdentifyShowFirstControl />
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
