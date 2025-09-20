<script setup lang="ts">
import { getUUIDv4 } from '@hungpvq/shared';
import { loggerFactory } from '@hungpvq/shared-log';
import type { MapSimple } from '@hungpvq/shared-map';
import { BaseMapCard, BaseMapControl } from '@hungpvq/vue-map-basemap';
import { getChartRandomColor, Map } from '@hungpvq/vue-map-core';
import {
  createDatasetPartChangeColorHighlightComponent,
  createDatasetPartGeojsonSourceComponent,
  createDatasetPartHighlightComponent,
  createDatasetPartListViewUiComponentBuilder,
  createGroupDataset,
  createMenuItemToggleShow,
  createMultiMapboxLayerComponent,
  createRootDataset,
  LayerControl,
  LayerHighlight,
  LayerSimpleMapboxBuild,
  useMapDataset,
} from '@hungpvq/vue-map-dataset';
import { ref } from 'vue';
import AsideControl from '../../layout/aside-control.vue';
import { createDatasetCustomHighlightComponent } from './helper';
loggerFactory.enable('map:highlight');
const mapId = ref(getUUIDv4());
function onMapLoaded(map: MapSimple) {
  const { addDataset } = useMapDataset(map.id);
  addDataset(createDefaultHighlight());
  addDataset(createChangeColorHighlight());
  addDataset(createCustomHighlight());
}
function createDefaultHighlight() {
  const dataset = createRootDataset('Default Highlight');
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: '1',
        },
        geometry: {
          coordinates: [105.78920149543677, 20.943262714981614],
          type: 'Point',
        },
      },
      {
        type: 'Feature',
        properties: {
          id: '2',
        },
        geometry: {
          coordinates: [
            [105.78040532029263, 20.727462654482267],
            [106.1036647594259, 20.92477770068014],
            [105.95632882584783, 20.915534338697114],
            [105.77050849523124, 20.859033309679518],
            [105.65066203209409, 20.86930774910546],
          ],
          type: 'LineString',
        },
      },
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
  const list1 = createDatasetPartListViewUiComponentBuilder('Default highlight')
    .setColor(getChartRandomColor())
    .configDisabledOpacity()
    .configInitShowLegend()
    .addMenus([createMenuItemToggleShow()])
    .build();
  const layer1 = createMultiMapboxLayerComponent('layer', [
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
  const highlight = createDatasetPartHighlightComponent();
  groupLayer1.add(layer1);
  groupLayer1.add(highlight);
  groupLayer1.add(list1);
  dataset.add(source);
  dataset.add(groupLayer1);
  return dataset;
}
function createChangeColorHighlight() {
  const dataset = createRootDataset('Change color Highlight');
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: '1',
        },
        geometry: {
          coordinates: [105.61081556232403, 21.1273787080941],
          type: 'Point',
        },
      },
      {
        type: 'Feature',
        properties: {
          id: '2',
        },
        geometry: {
          coordinates: [
            [105.30150956880232, 21.095550797627837],
            [105.17381764730067, 21.015268525753356],
            [105.28107422536527, 20.976007744738553],
            [105.37124457052539, 21.06345663819846],
          ],
          type: 'LineString',
        },
      },
      {
        type: 'Feature',
        properties: {
          id: '3',
        },
        geometry: {
          coordinates: [
            [
              [105.2320616024889, 21.22764784321741],
              [105.2320616024889, 21.140078834531636],
              [105.47045239753209, 21.140078834531636],
              [105.47045239753209, 21.22764784321741],
              [105.2320616024889, 21.22764784321741],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });
  const groupLayer1 = createGroupDataset('Group layer 1');
  const list1 = createDatasetPartListViewUiComponentBuilder(
    'Change color highlight',
  )
    .setColor(getChartRandomColor())
    .configDisabledOpacity()
    .configInitShowLegend()
    .addMenus([createMenuItemToggleShow()])
    .build();
  const layer1 = createMultiMapboxLayerComponent('layer', [
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
  const highlight = createDatasetPartChangeColorHighlightComponent();
  groupLayer1.add(layer1);
  groupLayer1.add(highlight);
  groupLayer1.add(list1);
  dataset.add(source);
  dataset.add(groupLayer1);
  return dataset;
}
function createCustomHighlight() {
  const dataset = createRootDataset('Custom Highlight');
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: '1',
        },
        geometry: {
          coordinates: [106.11280363142981, 21.189130192154835],
          type: 'Point',
        },
      },
      {
        type: 'Feature',
        properties: {
          id: '3',
        },
        geometry: {
          coordinates: [
            [106.22854873674976, 21.214260501931676],
            [106.3443667241857, 21.218473535343747],
            [106.3499660515746, 21.161870647222116],
            [106.25106784879875, 21.134618864235406],
          ],
          type: 'LineString',
        },
      },
      {
        type: 'Feature',
        properties: {
          id: '2',
        },
        geometry: {
          coordinates: [
            [
              [106.03635668869845, 21.352515361338718],
              [106.03635668869845, 21.31484519090337],
              [106.18474278754854, 21.31484519090337],
              [106.18474278754854, 21.352515361338718],
              [106.03635668869845, 21.352515361338718],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });
  const groupLayer1 = createGroupDataset('Group layer 1');
  const list1 = createDatasetPartListViewUiComponentBuilder('Custom highlight')
    .setColor('#0000FF')
    .configDisabledOpacity()
    .configInitShowLegend()
    .addMenus([createMenuItemToggleShow()])
    .build();
  const layer1 = createMultiMapboxLayerComponent('layer', [
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
  const highlight = createDatasetCustomHighlightComponent();
  groupLayer1.add(layer1);
  groupLayer1.add(highlight);
  groupLayer1.add(list1);
  dataset.add(source);
  dataset.add(groupLayer1);
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
    <LayerHighlight enableClick />
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
