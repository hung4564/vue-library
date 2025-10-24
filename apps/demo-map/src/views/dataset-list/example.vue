<script setup lang="ts">
import { getUUIDv4 } from '@hungpvq/shared';
import { loggerFactory } from '@hungpvq/shared-log';
import type { MapSimple } from '@hungpvq/shared-map';
import { BaseMapCard, BaseMapControl } from '@hungpvq/vue-map-basemap';
import { Map } from '@hungpvq/vue-map-core';
import {
  ComponentManagementControl,
  createDatasetPartListViewUiComponentBuilder,
  createMenuBuilder,
  createMultiLegend,
  createRootDataset,
  LayerControl,
  LayerHighlight,
  useMapDataset,
} from '@hungpvq/vue-map-dataset';
import { mdiPen } from '@mdi/js';
import { ref } from 'vue';
import AsideControl from '../../layout/aside-control.vue';
loggerFactory.enable('menu');
const mapId = ref(getUUIDv4());
function onMapLoaded(map: MapSimple) {
  const { addDataset } = useMapDataset(map.id);
  addDataset(createDefaultListDataset());
  addDataset(createCustomDefaultListDataset());
  addDataset(createListWithLegendDataset());
  addDataset(createListWithMenuDataset());
}

function createDefaultListDataset() {
  const dataset = createRootDataset('Default');
  const list1 =
    createDatasetPartListViewUiComponentBuilder('Default list').build();
  dataset.add(list1);
  return dataset;
}
function createCustomDefaultListDataset() {
  const dataset = createRootDataset('Default custom simple');
  const list1 = createDatasetPartListViewUiComponentBuilder(
    'Custom simple list',
  )
    .setColor('#0000FF')
    .setOpacity(0.5)
    .build();
  dataset.add(list1);
  return dataset;
}
function createListWithMenuDataset() {
  const dataset = createRootDataset('Default custom simple');
  const list1 = createDatasetPartListViewUiComponentBuilder(
    'Custom simple list',
  )
    .configDisabledDelete()
    .addMenus([
      createMenuBuilder()
        .item()
        .setLocation('extra')
        .setName('menu in extra')
        .setIcon(mdiPen)
        .build(),
      createMenuBuilder().divider().setLocation('extra').build(),
      createMenuBuilder()
        .item()
        .setLocation('extra')
        .setName('menu in extra')
        .setIcon(mdiPen)
        .build(),
      createMenuBuilder()
        .item()
        .setLocation('bottom')
        .setName('menu in bottom')
        .setIcon(mdiPen)
        .build(),
      createMenuBuilder().divider().setLocation('bottom').build(),
      createMenuBuilder()
        .item()
        .setLocation('bottom')
        .setName('menu in bottom')
        .setIcon(mdiPen)
        .build(),
      createMenuBuilder()
        .item()
        .setLocation('menu')
        .setName('menu in menu')
        .setIcon(mdiPen)
        .build(),
      createMenuBuilder().divider().setLocation('menu').build(),
      createMenuBuilder()
        .item()
        .setLocation('menu')
        .setName('menu in menu')
        .setIcon(mdiPen)
        .build(),
      createMenuBuilder()
        .item()
        .setLocation('prebottom')
        .setName('menu in prebottom')
        .setIcon(mdiPen)
        .build(),
      createMenuBuilder().divider().setLocation('prebottom').build(),
      createMenuBuilder()
        .item()
        .setLocation('prebottom')
        .setName('menu in prebottom')
        .setIcon(mdiPen)
        .build(),
    ])
    .build();
  dataset.add(list1);
  return dataset;
}
function createListWithLegendDataset() {
  const dataset = createRootDataset('Default');
  const list1 = createDatasetPartListViewUiComponentBuilder('List with legend')
    .configInitShowLegend()
    .setLegend(
      createMultiLegend([
        {
          type: 'color',
          value: { text: 'legend color', value: '#0000FF' },
        },
        {
          type: 'text',
          value: { text: 'legend text', value: 'test-value' },
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
      ]),
    )
    .build();
  dataset.add(list1);
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
    <LayerHighlight />
    <ComponentManagementControl />
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
