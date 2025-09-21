<script setup lang="ts">
import { getUUIDv4 } from '@hungpvq/shared';
import { loggerFactory } from '@hungpvq/shared-log';
import type { MapSimple } from '@hungpvq/shared-map';
import { BaseMapCard, BaseMapControl } from '@hungpvq/vue-map-basemap';
import { getChartRandomColor, Map } from '@hungpvq/vue-map-core';
import {
  ComponentManagementControl,
  createDatasetPartGeojsonSourceComponent,
  createDatasetPartHighlightComponent,
  createDatasetPartIdentifyComponentBuilder,
  createDatasetPartListViewUiComponentBuilder,
  createGroupDataset,
  createMenuItemShowDetailForItem,
  createMenuItemShowDetailInfoSource,
  createMenuItemStyleEdit,
  createMenuItemToBoundActionForItem,
  createMenuItemToggleShow,
  createMultiMapboxLayerComponent,
  createRootDataset,
  IdentifyControl,
  IdentifyShowFirstControl,
  LayerControl,
  LayerHighlight,
  LayerSimpleMapboxBuild,
  useMapDataset,
} from '@hungpvq/vue-map-dataset';
import { ref } from 'vue';
import AsideControl from '../../layout/aside-control.vue';
loggerFactory.enable('map:identify');
const mapId = ref(getUUIDv4());
const group = { id: 'Group Identify', name: 'Group Identify' };
function onMapLoaded(map: MapSimple) {
  const { addDataset } = useMapDataset(map.id);
  addDataset(createSimple());
  addDataset(createSimpleWithMenu());
  addDataset(createNoGroupIdentify());
  addDataset(createOtherDatasetButSameGroup());
  addDataset(createGroupIdentify());
}
function createSimple() {
  const dataset = createRootDataset('Simple identify');
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: '1',
          name: 'feature: Simple identify ',
        },
        geometry: {
          coordinates: [
            [
              [105.88682244523346, 21.184791364696125],
              [105.88682244523346, 21.116921872038418],
              [106.05662330762226, 21.116921872038418],
              [106.05662330762226, 21.184791364696125],
              [105.88682244523346, 21.184791364696125],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });
  const groupLayer = createGroupDataset('Group layer 1');
  const list = createDatasetPartListViewUiComponentBuilder('Simple identify')
    .setColor(getChartRandomColor())
    .build();
  const layer1 = createMultiMapboxLayerComponent('layer area', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list.color)
      .build(),
  ]);
  const highlight = createDatasetPartHighlightComponent();
  groupLayer.add(layer1);
  groupLayer.add(highlight);
  groupLayer.add(list);
  list.addMenus([createMenuItemToggleShow()]);
  const identify =
    createDatasetPartIdentifyComponentBuilder('Simple identify').build();
  dataset.add(identify);
  dataset.add(source);
  dataset.add(groupLayer);
  return dataset;
}
function createSimpleWithMenu() {
  const dataset = createRootDataset('Identify with menu');
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: '1',
          name: 'feature: Identify with menu',
        },
        geometry: {
          coordinates: [
            [
              [105.33907782961194, 21.179166900967587],
              [105.33907782961194, 20.896827873223472],
              [105.75969186796266, 20.896827873223472],
              [105.75969186796266, 21.179166900967587],
              [105.33907782961194, 21.179166900967587],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });
  const groupLayer = createGroupDataset('Group layer 1');
  const list = createDatasetPartListViewUiComponentBuilder('Identify with menu')
    .setColor(getChartRandomColor())
    .build();
  const layer1 = createMultiMapboxLayerComponent('layer area', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list.color)
      .build(),
  ]);
  const highlight = createDatasetPartHighlightComponent();
  groupLayer.add(layer1);
  groupLayer.add(highlight);
  groupLayer.add(list);
  list.addMenus([
    createMenuItemToggleShow(),
    createMenuItemShowDetailInfoSource(),
    createMenuItemStyleEdit(),
  ]);
  const identify = createDatasetPartIdentifyComponentBuilder(
    'Identify with menu',
  )
    .addMenus([
      createMenuItemToBoundActionForItem(),
      createMenuItemShowDetailForItem([
        { text: 'Id', value: 'id' },
        { text: 'Name', value: 'name' },
      ]),
    ])
    .build();
  dataset.add(identify);
  dataset.add(source);
  dataset.add(groupLayer);
  return dataset;
}
function createOtherDatasetButSameGroup() {
  const dataset = createRootDataset('Other Dataset but same group');
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: '1',
          name: 'feature: Other Dataset but same group ',
        },
        geometry: {
          coordinates: [
            [
              [105.44444615897697, 20.899297758842522],
              [105.44444615897697, 20.67343872335738],
              [105.78642132314343, 20.67343872335738],
              [105.78642132314343, 20.899297758842522],
              [105.44444615897697, 20.899297758842522],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });
  const groupLayer = createGroupDataset('Group layer 1');
  const list = createDatasetPartListViewUiComponentBuilder(
    'Other Dataset but same group',
  )
    .setColor(getChartRandomColor())
    .build();
  const layer1 = createMultiMapboxLayerComponent('layer area', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list.color)
      .build(),
  ]);
  const highlight = createDatasetPartHighlightComponent();
  groupLayer.add(layer1);
  groupLayer.add(highlight);
  groupLayer.add(list);
  list.addMenus([createMenuItemToggleShow()]);
  const identify = createDatasetPartIdentifyComponentBuilder(
    'Other Dataset but same group',
  )
    .setGroup(group)
    .build();
  dataset.add(identify);
  dataset.add(source);
  dataset.add(groupLayer);
  return dataset;
}
function createGroupIdentify() {
  const dataset = createRootDataset('Group Identify');
  const source1 = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: 2,
          name: 'feature 2 Group Identify',
        },
        geometry: {
          coordinates: [
            [
              [105.63135562387322, 20.797054008577902],
              [105.63135562387322, 20.500520627293113],
              [106.09655861537681, 20.500520627293113],
              [106.09655861537681, 20.797054008577902],
              [105.63135562387322, 20.797054008577902],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });

  const identify1 = createDatasetPartIdentifyComponentBuilder(
    'Group Identify 1',
  )
    .isUseMerge()
    .setGroup(group)
    .setConfigFields([
      { text: 'Id', value: 'id' },
      { text: 'Name', value: 'name' },
    ])
    .build();
  const groupLayer1 = createGroupDataset('Group Identify 1');
  const list1 = createDatasetPartListViewUiComponentBuilder('Group Identify 1')
    .setColor('#0000FF')
    .setGroup(group)
    .build();
  list1.color = '#0000FF';
  const layer1 = createMultiMapboxLayerComponent('layer area', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list1.color)
      .build(),
    new LayerSimpleMapboxBuild().setStyleType('line').setColor('#000').build(),
  ]);
  groupLayer1.add(source1);
  groupLayer1.add(layer1);
  groupLayer1.add(list1);
  groupLayer1.add(identify1);
  const groupLayer2 = createGroupDataset('Group Identify 2');
  const identify2 = createDatasetPartIdentifyComponentBuilder(
    'Group Identify 2',
  )
    .isUseMerge()
    .setGroup(group)
    .setConfigFields([
      { text: 'Id', value: 'id' },
      { text: 'Name', value: 'name' },
    ])
    .build();
  const list2 = createDatasetPartListViewUiComponentBuilder('Group Identify 2')
    .setColor('#ff0000')
    .setGroup(group)
    .build();
  const layer2 = createMultiMapboxLayerComponent('layer point', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list2.color)
      .build(),
    new LayerSimpleMapboxBuild().setStyleType('line').setColor('#000').build(),
  ]);
  const source2 = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: 3,
          name: 'feature 3 Group Identify',
        },
        geometry: {
          coordinates: [
            [
              [105.71455307455238, 20.840388211189335],
              [105.71455307455238, 20.72566421903626],
              [106.03406129600307, 20.72566421903626],
              [106.03406129600307, 20.840388211189335],
              [105.71455307455238, 20.840388211189335],
            ],
          ],
          type: 'Polygon',
        },
      },
      {
        type: 'Feature',
        properties: {
          id: 4,
          name: 'feature 4 Group Identify',
        },
        geometry: {
          coordinates: [
            [
              [105.74696486602863, 20.755977636405987],
              [105.74696486602863, 20.61085136021447],
              [105.89977425617587, 20.61085136021447],
              [105.89977425617587, 20.755977636405987],
              [105.74696486602863, 20.755977636405987],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });
  const highlight = createDatasetPartHighlightComponent();
  const highlight2 = createDatasetPartHighlightComponent();
  groupLayer2.add(source2);
  groupLayer2.add(layer2);
  groupLayer2.add(list2);
  groupLayer2.add(identify2);
  groupLayer1.add(highlight);
  groupLayer2.add(highlight2);
  dataset.add(groupLayer1);
  dataset.add(groupLayer2);
  return dataset;
}
function createNoGroupIdentify() {
  const dataset = createRootDataset('No group identify');
  const source1 = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: 1,
          name: 'feature 1: identify no group',
        },
        geometry: {
          coordinates: [
            [
              [105.56255318926247, 21.50065365631515],
              [105.56255318926247, 21.403263985529975],
              [105.84908819639861, 21.403263985529975],
              [105.84908819639861, 21.50065365631515],
              [105.56255318926247, 21.50065365631515],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });

  const group = { id: 'No Group Identify', name: 'No Group Identify' };
  const identify1 = createDatasetPartIdentifyComponentBuilder(
    'No Group Identify 1',
  ).build();
  const groupLayer1 = createGroupDataset('No group identify 1');
  const list1 = createDatasetPartListViewUiComponentBuilder(
    'No group identify 1',
  )
    .setColor('#0000FF')
    .setGroup(group)
    .build();
  list1.color = '#0000FF';
  const layer1 = createMultiMapboxLayerComponent('layer area', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list1.color)
      .build(),
    new LayerSimpleMapboxBuild().setStyleType('line').setColor('#000').build(),
  ]);
  groupLayer1.add(source1);
  groupLayer1.add(layer1);
  groupLayer1.add(list1);
  groupLayer1.add(identify1);
  const groupLayer2 = createGroupDataset('No group identify 2');
  const identify2 = createDatasetPartIdentifyComponentBuilder(
    'No group identify 2',
  ).build();
  const list2 = createDatasetPartListViewUiComponentBuilder(
    'No group identify 2',
  )
    .setColor('#ff0000')
    .setGroup(group)
    .build();
  const layer2 = createMultiMapboxLayerComponent('layer point', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list2.color)
      .build(),
    new LayerSimpleMapboxBuild().setStyleType('line').setColor('#000').build(),
  ]);
  const source2 = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: 2,
          name: 'feature 2: identify no group',
        },
        geometry: {
          coordinates: [
            [
              [105.80103412547533, 21.55472769478591],
              [105.80103412547533, 21.446510825568424],
              [106.16705691566278, 21.446510825568424],
              [106.16705691566278, 21.55472769478591],
              [105.80103412547533, 21.55472769478591],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });
  const highlight = createDatasetPartHighlightComponent();
  const highlight2 = createDatasetPartHighlightComponent();
  groupLayer2.add(source2);
  groupLayer2.add(layer2);
  groupLayer2.add(list2);
  groupLayer2.add(identify2);
  groupLayer1.add(highlight);
  groupLayer2.add(highlight2);
  dataset.add(groupLayer1);
  dataset.add(groupLayer2);
  return dataset;
}
</script>
<template>
  <Map @map-loaded="onMapLoaded" :mapId="mapId">
    <AsideControl position="top-left" />
    <BaseMapControl position="bottom-left" />
    <LayerControl position="top-left" show>
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerControl>
    <ComponentManagementControl />
    <LayerHighlight enableClick />
    <IdentifyControl position="top-right" />
    <IdentifyShowFirstControl position="top-right" />
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
