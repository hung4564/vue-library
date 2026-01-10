<script setup lang="ts">
import { getUUIDv4 } from '@hungpvq/shared';
import { loggerFactory } from '@hungpvq/shared-log';
import type { MapSimple } from '@hungpvq/shared-map';
import { BaseMapCard, BaseMapControl } from '@hungpvq/vue-map-basemap';
import { getChartRandomColor, Map, ZoomControl } from '@hungpvq/vue-map-core';
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
  addDataset(createHighlightWithPropertyName());
  addDataset(createCustomAnimateWithFilterFunction());
  addDataset(createDefaultHighlightWithFilterFunction());
  addDataset(createCustomAnimateWithFieldName());
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
          coordinates: [105.7892014954, 20.943262715],
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
            [105.7804053203, 20.7274626545],
            [106.1036647594, 20.9247777007],
            [105.9563288258, 20.9155343387],
            [105.7705084952, 20.8590333097],
            [105.6506620321, 20.8693077491],
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
              [105.9475326507, 20.6369404209],
              [106.1212571097, 20.6369404209],
              [106.1212571097, 20.7192355919],
              [105.9475326507, 20.7192355919],
              [105.9475326507, 20.6369404209],
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
          coordinates: [105.6108155623, 21.1273787081],
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
            [105.3015095688, 21.0955507976],
            [105.1738176473, 21.0152685258],
            [105.2810742254, 20.9760077447],
            [105.3712445705, 21.0634566382],
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
              [105.2320616025, 21.2276478432],
              [105.2320616025, 21.1400788345],
              [105.4704523975, 21.1400788345],
              [105.4704523975, 21.2276478432],
              [105.2320616025, 21.2276478432],
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
          coordinates: [106.1128036314, 21.1891301922],
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
            [106.2285487367, 21.2142605019],
            [106.3443667242, 21.2184735353],
            [106.3499660516, 21.1618706472],
            [106.2510678488, 21.1346188642],
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
              [106.0363566887, 21.3525153613],
              [106.0363566887, 21.3148451909],
              [106.1847427875, 21.3148451909],
              [106.1847427875, 21.3525153613],
              [106.0363566887, 21.3525153613],
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
function createHighlightWithPropertyName() {
  const dataset = createRootDataset('Highlight with Property Name');
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          code: 'P001',
          name: 'Point 1',
        },
        geometry: {
          coordinates: [105.8892014954, 20.743262715],
          type: 'Point',
        },
      },
      {
        type: 'Feature',
        properties: {
          code: 'L002',
          name: 'Line 2',
        },
        geometry: {
          coordinates: [
            [105.7804053203, 20.5274626545],
            [106.0036647594, 20.7247777007],
            [105.8563288258, 20.7155343387],
          ],
          type: 'LineString',
        },
      },
      {
        type: 'Feature',
        properties: {
          code: 'A003',
          name: 'Area 3',
        },
        geometry: {
          coordinates: [
            [
              [105.8475326507, 20.4369404209],
              [106.0212571097, 20.4369404209],
              [106.0212571097, 20.5192355919],
              [105.8475326507, 20.5192355919],
              [105.8475326507, 20.4369404209],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });
  const groupLayer1 = createGroupDataset('Group layer 1');
  const list1 = createDatasetPartListViewUiComponentBuilder(
    'Highlight by property "code"',
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
  // Ví dụ: Sử dụng property name 'code' thay vì 'id'
  const highlight = createDatasetPartHighlightComponent(undefined, {
    filterCreator: 'code', // Sử dụng property 'code' để filter
  });
  groupLayer1.add(layer1);
  groupLayer1.add(highlight);
  groupLayer1.add(list1);
  dataset.add(source);
  dataset.add(groupLayer1);
  return dataset;
}
function createCustomAnimateWithFilterFunction() {
  const dataset = createRootDataset('Custom Animate with Filter Function');
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          code: 'ANIM001',
          type: 'important',
          status: 'active',
          priority: 1,
        },
        geometry: {
          coordinates: [106.1892014954, 20.943262715],
          type: 'Point',
        },
      },
      {
        type: 'Feature',
        properties: {
          code: 'ANIM002',
          type: 'important',
          status: 'active',
          priority: 2,
        },
        geometry: {
          coordinates: [
            [106.0804053203, 20.7274626545],
            [106.2036647594, 20.9247777007],
            [106.0563288258, 20.9155343387],
          ],
          type: 'LineString',
        },
      },
      {
        type: 'Feature',
        properties: {
          code: 'ANIM003',
          type: 'normal',
          status: 'inactive',
          priority: 3,
        },
        geometry: {
          coordinates: [
            [
              [106.1475326507, 20.6369404209],
              [106.3212571097, 20.6369404209],
              [106.3212571097, 20.7192355919],
              [106.1475326507, 20.7192355919],
              [106.1475326507, 20.6369404209],
            ],
          ],
          type: 'Polygon',
        },
      },
      {
        type: 'Feature',
        properties: {
          code: 'ANIM004',
          type: 'important',
          status: 'active',
          priority: 1,
        },
        geometry: {
          coordinates: [
            [
              [106.2475326507, 20.7369404209],
              [106.4212571097, 20.7369404209],
              [106.4212571097, 20.8192355919],
              [106.2475326507, 20.8192355919],
              [106.2475326507, 20.7369404209],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });
  const groupLayer1 = createGroupDataset('Group layer 1');
  const list1 = createDatasetPartListViewUiComponentBuilder(
    'Custom animate with filter function',
  )
    .setColor('#00FF00')
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
  // Ví dụ: Sử dụng filterCreator dạng function để tạo filter phức tạp
  // Chỉ highlight các feature có type='important' VÀ status='active' VÀ priority <= 2
  const highlight = createDatasetCustomHighlightComponent(undefined, {
    filterCreator: () => {
      return [
        'all',
        ['==', 'type', 'important'],
        ['==', 'status', 'active'],
        ['<=', 'priority', 2],
      ];
    },
  });
  groupLayer1.add(layer1);
  groupLayer1.add(highlight);
  groupLayer1.add(list1);
  dataset.add(source);
  dataset.add(groupLayer1);
  return dataset;
}
function createDefaultHighlightWithFilterFunction() {
  const dataset = createRootDataset('Default Highlight with Filter Function');
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          category: 'building',
          status: 'active',
          priority: 'high',
          code: 'BLD001',
        },
        geometry: {
          coordinates: [105.8892014954, 20.843262715],
          type: 'Point',
        },
      },
      {
        type: 'Feature',
        properties: {
          category: 'road',
          status: 'active',
          priority: 'medium',
          code: 'ROD002',
        },
        geometry: {
          coordinates: [
            [105.7804053203, 20.6274626545],
            [106.0036647594, 20.8247777007],
            [105.8563288258, 20.8155343387],
          ],
          type: 'LineString',
        },
      },
      {
        type: 'Feature',
        properties: {
          category: 'park',
          status: 'inactive',
          priority: 'low',
          code: 'PRK003',
        },
        geometry: {
          coordinates: [
            [
              [105.8475326507, 20.5369404209],
              [106.0212571097, 20.5369404209],
              [106.0212571097, 20.6192355919],
              [105.8475326507, 20.6192355919],
              [105.8475326507, 20.5369404209],
            ],
          ],
          type: 'Polygon',
        },
      },
      {
        type: 'Feature',
        properties: {
          category: 'building',
          status: 'active',
          priority: 'high',
          code: 'BLD004',
        },
        geometry: {
          coordinates: [
            [
              [105.9475326507, 20.6369404209],
              [106.1212571097, 20.6369404209],
              [106.1212571097, 20.7192355919],
              [105.9475326507, 20.7192355919],
              [105.9475326507, 20.6369404209],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });
  const groupLayer1 = createGroupDataset('Group layer 1');
  const list1 = createDatasetPartListViewUiComponentBuilder(
    'Default highlight with filter function',
  )
    .setColor('#FF6600')
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
  // Ví dụ: Default highlight với filterCreator dạng function
  // Chỉ highlight các feature có category='building' VÀ status='active' VÀ priority='high'
  const highlight = createDatasetPartHighlightComponent(undefined, {
    filterCreator: () => {
      return [
        'all',
        ['==', 'category', 'building'],
        ['==', 'status', 'active'],
        ['==', 'priority', 'high'],
      ];
    },
  });
  groupLayer1.add(layer1);
  groupLayer1.add(highlight);
  groupLayer1.add(list1);
  dataset.add(source);
  dataset.add(groupLayer1);
  return dataset;
}
function createCustomAnimateWithFieldName() {
  const dataset = createRootDataset('Custom Animate with Field Name');
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          productCode: 'PRD001',
          name: 'Product A',
        },
        geometry: {
          coordinates: [106.0892014954, 20.943262715],
          type: 'Point',
        },
      },
      {
        type: 'Feature',
        properties: {
          productCode: 'PRD002',
          name: 'Product B',
        },
        geometry: {
          coordinates: [
            [105.9804053203, 20.7274626545],
            [106.2036647594, 20.9247777007],
            [106.0563288258, 20.9155343387],
          ],
          type: 'LineString',
        },
      },
      {
        type: 'Feature',
        properties: {
          productCode: 'PRD003',
          name: 'Product C',
        },
        geometry: {
          coordinates: [
            [
              [106.1475326507, 20.6369404209],
              [106.3212571097, 20.6369404209],
              [106.3212571097, 20.7192355919],
              [106.1475326507, 20.7192355919],
              [106.1475326507, 20.6369404209],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });
  const groupLayer1 = createGroupDataset('Group layer 1');
  const list1 = createDatasetPartListViewUiComponentBuilder(
    'Custom animate with field name',
  )
    .setColor('#9900FF')
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
  // Ví dụ: Custom animate highlight với filterCreator dạng field name (string)
  // Sử dụng property 'productCode' để filter thay vì 'id'
  const highlight = createDatasetCustomHighlightComponent(undefined, {
    filterCreator: 'productCode', // Sử dụng property 'productCode' để filter
  });
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
    <ZoomControl />
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
