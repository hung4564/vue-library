<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import { getUUIDv4 } from '@hungpvq/shared';
import { loggerFactory } from '@hungpvq/shared-log';
import { BaseMapCard, BaseMapControl, Map, UniversalRegistry } from '@hungpvq/vue-map-core';
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
import { mdiPen, mdiStar } from '@mdi/js';
import { reactive, ref } from 'vue';
import AsideControl from '../../layout/aside-control.vue';
import SampleCustomMenu from './sample-custom-menu.vue';

UniversalRegistry.registerComponent('sample-layer-menu', SampleCustomMenu);
loggerFactory.enable('menu');
const mapId = ref(getUUIDv4());
const menuUi = reactive({
  role: 'admin' as 'admin' | 'viewer',
  canUsePen: true,
});
function onMapLoaded(map: MapSimple) {
  const { addDataset } = useMapDataset(map.id);
  addDataset(createDefaultListDataset());
  addDataset(createCustomDefaultListDataset());
  addDataset(createListWithLegendDataset());
  addDataset(createListWithMenuDataset());
  addDataset(createListWithCustomMenuComponentDataset());
  addDataset(createListWithConditionMenusDataset());
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
    'Custom menu list',
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
          value: { text: 'legend color', color: '#0000FF' },
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

function createListWithCustomMenuComponentDataset() {
  const dataset = createRootDataset('Custom menu component');
  const list1 = createDatasetPartListViewUiComponentBuilder(
    'Menu with setComponentMenuKey',
  )
    .addMenus([
      createMenuBuilder()
        .item()
        .setLocation('menu')
        .setName('Sample custom menu')
        .setIcon(mdiStar)
        .setComponentMenuKey('sample-layer-menu')
        .build(),
    ])
    .build();
  dataset.add(list1);
  return dataset;
}

function createListWithConditionMenusDataset() {
  const dataset = createRootDataset('Menu conditions');
  const list1 = createDatasetPartListViewUiComponentBuilder(
    'Hidden / disabled from menuContext',
  )
    .addMenus([
      createMenuBuilder()
        .item()
        .setLocation('menu')
        .setName('Admin only')
        .setIcon(mdiStar)
        .setHidden(({ context }) => context?.role !== 'admin')
        .setClick(() => {
          console.info('admin only menu');
        })
        .build(),
      createMenuBuilder()
        .item()
        .setLocation('menu')
        .setName('Pen action')
        .setIcon(mdiPen)
        .setDisabled(({ context }) => !context?.canUsePen)
        .setClick(() => {
          console.info('pen action');
        })
        .build(),
      createMenuBuilder()
        .item()
        .setLocation('extra')
        .setName('Pen extra')
        .setIcon(mdiPen)
        .setDisabled(({ context }) => !context?.canUsePen)
        .setClick(() => {
          console.info('pen extra');
        })
        .build(),
    ])
    .build();
  dataset.add(list1);
  return dataset;
}
</script>
<template>
  <Map @map-loaded="onMapLoaded" :mapId="mapId">
    <AsideControl position="top-left" />
    <BaseMapControl position="bottom-left" />
    <LayerControl position="top-left" show :menu-context="menuUi">
      <template #titleList>
        <label class="menu-condition-toggle">
          <input
            type="checkbox"
            :checked="menuUi.role === 'admin'"
            @change="
              menuUi.role = ($event.target as HTMLInputElement).checked
                ? 'admin'
                : 'viewer'
            "
          />
          admin
        </label>
        <label class="menu-condition-toggle">
          <input type="checkbox" v-model="menuUi.canUsePen" />
          pen
        </label>
      </template>
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerControl>
    <LayerHighlight />
    <ComponentManagementControl />
  </Map>
</template>

<style>
.menu-condition-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: 8px;
  font-size: 12px;
  white-space: nowrap;
}
</style>

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
