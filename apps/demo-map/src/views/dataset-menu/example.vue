<script setup lang="ts">
import { getUUIDv4 } from '@hungpvq/shared';
import { loggerFactory } from '@hungpvq/shared-log';
import type { MapSimple } from '@hungpvq/shared-map';
import { BaseMapCard, BaseMapControl } from '@hungpvq/vue-map-basemap';
import { getChartRandomColor, Map } from '@hungpvq/vue-map-core';
import {
  ComponentManagementControl,
  createDatasetPartGeojsonSourceComponent,
  createDatasetPartListViewUiComponentBuilder,
  createGroupDataset,
  createMenuBuilder,
  createMenuClickBuilder,
  createMenuClickHighlightBuilder,
  createMenuItemShowDetailInfoSource,
  createMenuItemStyleEdit,
  createMenuItemToBoundActionForList,
  createMenuItemToggleShow,
  createMultiMapboxLayerComponent,
  createRootDataset,
  LayerControl,
  LayerHighlight,
  LayerSimpleMapboxBuild,
  MenuItemClick,
  MenuItemProps,
  UniversalRegistry,
  useMapDataset,
} from '@hungpvq/vue-map-dataset';
import {
  mdiAppleKeyboardCommand,
  mdiCrosshairsGps,
  mdiMarker,
  mdiPen,
  mdiRegisteredTrademark,
} from '@mdi/js';
import { ref } from 'vue';
import AsideControl from '../../layout/aside-control.vue';
loggerFactory.enable('menu');
const mapId = ref(getUUIDv4());
function onMapLoaded(map: MapSimple) {
  const { addDataset } = useMapDataset(map.id);
  addDataset(createDefaultSupportDataset());
  addDataset(createCustomSupportDataset());
  addDataset(createCustomMultiSupportDataset());
  addDataset(createCustomChainSupportDataset());
}
function createDefaultSupportDataset() {
  const dataset = createRootDataset('Default menu support');
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: '3',
        },
        geometry: {
          coordinates: [
            [
              [105.94753265070807, 20.636940420905717],
              [106.12125710970412, 20.636940420905717],
              [106.12125710970412, 20.719235591893252],
              [105.94753265070807, 20.719235591893252],
              [105.94753265070807, 20.636940420905717],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });
  const groupLayer1 = createGroupDataset('Group layer 1');
  const list1 = createDatasetPartListViewUiComponentBuilder(
    'Default menu support',
  )
    .setColor(getChartRandomColor())
    .configDisabledDelete()
    .addMenus([
      createMenuItemToggleShow(),
      createMenuItemStyleEdit(),
      createMenuItemShowDetailInfoSource(),
      createMenuItemToBoundActionForList({
        bbox: [
          105.94753265070807, 20.636940420905717, 106.12125710970412,
          20.719235591893252,
        ],
      }),
    ])
    .build();
  const layer1 = createMultiMapboxLayerComponent('layer', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list1.color)
      .build(),
  ]);
  groupLayer1.add(layer1);
  groupLayer1.add(list1);
  dataset.add(source);
  dataset.add(groupLayer1);
  return dataset;
}
UniversalRegistry.registerMenuHandler(
  'custom-menu-handle',
  (props: MenuItemProps) => {
    console.info('custom-menu-handle in registry', props);
  },
);
function createCustomChainSupportDataset() {
  const dataset = createRootDataset('Custom menu chain support');
  const list1 = createDatasetPartListViewUiComponentBuilder(
    'Custom menu chain support',
  )
    .setColor(getChartRandomColor())
    .configDisabledDelete()
    .addMenus([
      createCustomMenuItem(
        mdiAppleKeyboardCommand,
        'custom click with execute',
        createMenuClickBuilder()
          .addCommand({
            execute(click, props) {
              console.info('custom chain execute', props);
              return createMenuClickBuilder().addCommand({
                execute(click, props) {
                  console.info('custom chain after execute', click, props);
                },
              });
            },
          })
          .build(),
      ),
      createCustomMenuItem(
        mdiPen,
        'custom click',
        createMenuClickBuilder()
          .addCommand((props) => {
            console.info('custom chain click', props);
            return createMenuClickBuilder().addCommand({
              execute(click, props) {
                console.info('custom chain after click', click, props);
              },
            });
          })
          .build(),
      ),
    ])
    .build();
  dataset.add(list1);
  return dataset;
}
function createCustomSupportDataset() {
  const dataset = createRootDataset('Custom menu support');
  const list1 = createDatasetPartListViewUiComponentBuilder(
    'Custom menu support',
  )
    .setColor(getChartRandomColor())
    .configDisabledDelete()
    .addMenus([
      createCustomMenuItem(
        mdiCrosshairsGps,
        'custom use menu fitBounds',
        createMenuClickBuilder()
          .addTupleStatic('fitBounds', {
            value: [
              105.94753265070807, 20.636940420905717, 106.12125710970412,
              20.719235591893252,
            ],
          })
          .build(),
      ),
      createCustomMenuItem(
        mdiAppleKeyboardCommand,
        'custom click with execute',
        createMenuClickBuilder()
          .addCommand({
            execute(click, props) {
              console.info('custom execute', click, props);
            },
          })
          .build(),
      ),
      createCustomMenuItem(
        mdiRegisteredTrademark,
        'custom click in registry',
        createMenuClickBuilder().addCommand('custom-menu-handle').build(),
      ),
      createCustomMenuItem(
        mdiPen,
        'custom click',
        createMenuClickBuilder()
          .addCommand((props) => {
            console.info('custom click', props);
          })
          .build(),
      ),
      createCustomWithTransfromMenuItem(
        mdiAppleKeyboardCommand,
        'custom click with execute',
        createMenuClickBuilder()
          .addTupleDynamic(
            {
              execute(click, props) {
                console.info('custom execute', click, props);
              },
            },
            (props) => {
              alert('custom use execute and transform');
              console.info('custom use execute and transform', props);
              return {
                value: 'custom',
              };
            },
          )
          .build(),
      ),
      createCustomWithTransfromMenuItem(
        mdiRegisteredTrademark,
        'custom use registry and transform',
        createMenuClickBuilder()
          .addTupleDynamic('custom-menu-handle', (props) => {
            alert('custom use registry and transform');
            console.info('custom use registry and transform', props);
            return {
              value: 'custom',
            };
          })
          .build(),
      ),
      createCustomWithTransfromMenuItem(
        mdiMarker,
        'custom use menu fitBounds and transform',
        createMenuClickBuilder()
          .addTupleDynamic('highlight', (props) => {
            alert('custom use menu fitBounds and transform');
            console.info('custom use menu fitBounds and transform', props);
            return {
              value: createMenuClickHighlightBuilder()
                .setDetail({
                  type: 'Feature',
                  properties: {
                    id: '3',
                  },
                  geometry: {
                    coordinates: [
                      [
                        [105.94753265070807, 20.636940420905717],
                        [106.12125710970412, 20.636940420905717],
                        [106.12125710970412, 20.719235591893252],
                        [105.94753265070807, 20.719235591893252],
                        [105.94753265070807, 20.636940420905717],
                      ],
                    ],
                    type: 'Polygon',
                  },
                })
                .setKey('identify')
                .build(),
            };
          })
          .build(),
      ),
    ])
    .build();
  dataset.add(list1);
  return dataset;
}
function createCustomMultiSupportDataset() {
  const dataset = createRootDataset('Custom menu with multi action');
  const list1 = createDatasetPartListViewUiComponentBuilder(
    'Custom menu with multi action',
  )
    .setColor(getChartRandomColor())
    .configDisabledDelete()
    .addMenus([
      createCustomMenuItem(
        mdiAppleKeyboardCommand,
        'custom click with execute',
        createMenuClickBuilder()
          .addCommand({
            execute(click, props) {
              console.info('custom execute', click, props);
            },
          })
          .addCommand('custom-menu-handle')
          .addCommand((props) => {
            console.info('custom click', props);
          })
          .addTupleDynamic(
            {
              execute(click, props) {
                console.info('custom execute after transform', click, props);
              },
            },
            (props) => {
              console.info('custom use execute and transform', props);
              return {
                value: 'custom',
              };
            },
          )
          .addTupleDynamic('custom-menu-handle', (props) => {
            console.info('custom use registry and transform', props);
            return {
              value: 'custom',
            };
          })
          .addTupleDynamic('highlight', (props) => {
            console.info('custom use menu fitBounds and transform', props);
            return {
              value: createMenuClickHighlightBuilder()
                .setDetail({
                  type: 'Feature',
                  properties: {
                    id: '3',
                  },
                  geometry: {
                    coordinates: [
                      [
                        [105.94753265070807, 20.636940420905717],
                        [106.12125710970412, 20.636940420905717],
                        [106.12125710970412, 20.719235591893252],
                        [105.94753265070807, 20.719235591893252],
                        [105.94753265070807, 20.636940420905717],
                      ],
                    ],
                    type: 'Polygon',
                  },
                })
                .setKey('identify')
                .build(),
            };
          })
          .build(),
      ),
    ])
    .build();
  dataset.add(list1);
  return dataset;
}
function createCustomMenuItem(icon: any, name: string, click: MenuItemClick) {
  return createMenuBuilder()
    .item()
    .setLocation('extra')
    .setName(name)
    .setIcon(icon)
    .setClick(click)
    .build();
}
function createCustomWithTransfromMenuItem(
  icon: any,
  name: string,
  click: MenuItemClick,
) {
  return createMenuBuilder()
    .item()
    .setLocation('bottom')
    .setName(name)
    .setIcon(icon)
    .setClick(click)
    .build();
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
