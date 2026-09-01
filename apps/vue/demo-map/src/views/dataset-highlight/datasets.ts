import { getChartRandomColor } from '@hungpvq/map-core';
import type { IDataset, IHighlightView } from '@hungpvq/vue-map-dataset';
import {
  createDatasetPartChangeColorHighlightComponent,
  createDatasetPartFeatureStateHighlightComponent,
  createDatasetPartGeojsonSourceComponent,
  createDatasetPartHighlightComponent,
  createDatasetPartListViewUiComponentBuilder,
  createDatasetPartShadowHighlightComponent,
  createGroupDataset,
  createMenuItemToggleShow,
  createMultiMapboxLayerComponent,
  createRootDataset,
  LayerSimpleMapboxBuild,
} from '@hungpvq/vue-map-dataset';
import type { Feature } from 'geojson';
import { createDatasetCustomHighlightComponent } from './helper';

function point(coords: [number, number], properties: Record<string, unknown>): Feature {
  const id = properties.id;
  return {
    type: 'Feature',
    id: typeof id === 'string' || typeof id === 'number' ? id : undefined,
    properties,
    geometry: { type: 'Point', coordinates: coords },
  };
}

function line(coords: [number, number][], properties: Record<string, unknown>): Feature {
  const id = properties.id;
  return {
    type: 'Feature',
    id: typeof id === 'string' || typeof id === 'number' ? id : undefined,
    properties,
    geometry: { type: 'LineString', coordinates: coords },
  };
}

function polygon(
  coords: [number, number][][],
  properties: Record<string, unknown>,
): Feature {
  const id = properties.id;
  return {
    type: 'Feature',
    id: typeof id === 'string' || typeof id === 'number' ? id : undefined,
    properties,
    geometry: { type: 'Polygon', coordinates: coords },
  };
}

function createHighlightDemoDataset(config: {
  name: string;
  listName: string;
  color?: string;
  features: Feature[];
  highlight: IHighlightView;
  promoteId?: string;
}): IDataset {
  const dataset = createRootDataset(config.name);
  const source = createDatasetPartGeojsonSourceComponent(
    'source',
    {
      type: 'FeatureCollection',
      features: config.features,
    },
    config.promoteId ? { promoteId: config.promoteId } : undefined,
  );
  const group = createGroupDataset('Group layer 1');
  const list = createDatasetPartListViewUiComponentBuilder(config.listName)
    .setColor(config.color || getChartRandomColor())
    .configDisabledOpacity()
    .configInitShowLegend()
    .addMenus([createMenuItemToggleShow()])
    .build();
  const layer = createMultiMapboxLayerComponent('layer', [
    new LayerSimpleMapboxBuild()
      .setStyleType('point')
      .setFilter(['==', '$type', 'Point'])
      .setColor(list.color)
      .build(),
    new LayerSimpleMapboxBuild()
      .setStyleType('line')
      .setFilter(['==', '$type', 'LineString'])
      .setColor(list.color)
      .build(),
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setFilter(['==', '$type', 'Polygon'])
      .setOpacity(0.5)
      .setColor(list.color)
      .build(),
  ]);
  group.add(layer);
  group.add(config.highlight);
  group.add(list);
  dataset.add(source);
  dataset.add(group);
  return dataset;
}

export function createAllHighlightDemoDatasets(): IDataset[] {
  return [
    createDefaultHighlight(),
    createShadowHighlight(),
    createChangeColorHighlight(),
    createCustomHighlight(),
    createHighlightWithPropertyName(),
    createHighlightWithExplicitIdField(),
    createCustomAnimateWithFilterFunction(),
    createDefaultHighlightWithFilterFunction(),
    createCustomAnimateWithFieldName(),
    createShadowWithPropertyFilter(),
    createHighlightByClickedCategory(),
    createFeatureStateHighlight(),
    createFeatureStateHighlightWithGroup(),
  ];
}

function createDefaultHighlight() {
  return createHighlightDemoDataset({
    name: 'Default Highlight',
    listName: 'Default highlight (blink + id)',
    features: [
      point([105.7892014954, 20.943262715], { id: '1' }),
      line(
        [
          [105.7804053203, 20.7274626545],
          [106.1036647594, 20.9247777007],
          [105.9563288258, 20.9155343387],
          [105.7705084952, 20.8590333097],
          [105.6506620321, 20.8693077491],
        ],
        { id: '2' },
      ),
      polygon(
        [
          [
            [105.9475326507, 20.6369404209],
            [106.1212571097, 20.6369404209],
            [106.1212571097, 20.7192355919],
            [105.9475326507, 20.7192355919],
            [105.9475326507, 20.6369404209],
          ],
        ],
        { id: '3' },
      ),
    ],
    highlight: createDatasetPartHighlightComponent(),
  });
}

function createShadowHighlight() {
  return createHighlightDemoDataset({
    name: 'Shadow Highlight',
    listName: 'Shadow highlight (static glow)',
    features: [
      point([105.45, 20.55], { id: '1' }),
      line(
        [
          [105.35, 20.5],
          [105.55, 20.58],
          [105.48, 20.48],
        ],
        { id: '2' },
      ),
      polygon(
        [
          [
            [105.4, 20.4],
            [105.58, 20.4],
            [105.58, 20.52],
            [105.4, 20.52],
            [105.4, 20.4],
          ],
        ],
        { id: '3' },
      ),
    ],
    highlight: createDatasetPartShadowHighlightComponent('#FFB703'),
  });
}

function createChangeColorHighlight() {
  return createHighlightDemoDataset({
    name: 'Change color Highlight',
    listName: 'Change color highlight',
    features: [
      point([105.6108155623, 21.1273787081], { id: '1' }),
      line(
        [
          [105.3015095688, 21.0955507976],
          [105.1738176473, 21.0152685258],
          [105.2810742254, 20.9760077447],
          [105.3712445705, 21.0634566382],
        ],
        { id: '2' },
      ),
      polygon(
        [
          [
            [105.2320616025, 21.2276478432],
            [105.2320616025, 21.1400788345],
            [105.4704523975, 21.1400788345],
            [105.4704523975, 21.2276478432],
            [105.2320616025, 21.2276478432],
          ],
        ],
        { id: '3' },
      ),
    ],
    highlight: createDatasetPartChangeColorHighlightComponent(),
  });
}

function createCustomHighlight() {
  return createHighlightDemoDataset({
    name: 'Custom Highlight',
    listName: 'Custom animate highlight',
    color: '#0000FF',
    features: [
      point([106.1128036314, 21.1891301922], { id: '1' }),
      line(
        [
          [106.2285487367, 21.2142605019],
          [106.3443667242, 21.2184735353],
          [106.3499660516, 21.1618706472],
          [106.2510678488, 21.1346188642],
        ],
        { id: '3' },
      ),
      polygon(
        [
          [
            [106.0363566887, 21.3525153613],
            [106.0363566887, 21.3148451909],
            [106.1847427875, 21.3148451909],
            [106.1847427875, 21.3525153613],
            [106.0363566887, 21.3525153613],
          ],
        ],
        { id: '2' },
      ),
    ],
    highlight: createDatasetCustomHighlightComponent(),
  });
}

function createHighlightWithPropertyName() {
  return createHighlightDemoDataset({
    name: 'Highlight with Property Name',
    listName: 'Default + filterCreator "code"',
    features: [
      point([105.8892014954, 20.743262715], { code: 'P001', name: 'Point 1' }),
      line(
        [
          [105.7804053203, 20.5274626545],
          [106.0036647594, 20.7247777007],
          [105.8563288258, 20.7155343387],
        ],
        { code: 'L002', name: 'Line 2' },
      ),
      polygon(
        [
          [
            [105.8475326507, 20.4369404209],
            [106.0212571097, 20.4369404209],
            [106.0212571097, 20.5192355919],
            [105.8475326507, 20.5192355919],
            [105.8475326507, 20.4369404209],
          ],
        ],
        { code: 'A003', name: 'Area 3' },
      ),
    ],
    highlight: createDatasetPartHighlightComponent(undefined, {
      filterCreator: 'code',
    }),
  });
}

function createHighlightWithExplicitIdField() {
  return createHighlightDemoDataset({
    name: 'Highlight filterCreator id',
    listName: 'Default + filterCreator "id"',
    features: [
      point([105.55, 21.02], { id: 'id-1', name: 'Point' }),
      line(
        [
          [105.5, 20.98],
          [105.65, 21.05],
        ],
        { id: 'id-2', name: 'Line' },
      ),
      polygon(
        [
          [
            [105.5, 20.9],
            [105.62, 20.9],
            [105.62, 20.98],
            [105.5, 20.98],
            [105.5, 20.9],
          ],
        ],
        { id: 'id-3', name: 'Area' },
      ),
    ],
    highlight: createDatasetPartHighlightComponent(undefined, {
      filterCreator: 'id',
    }),
  });
}

function createCustomAnimateWithFilterFunction() {
  return createHighlightDemoDataset({
    name: 'Custom Animate with Filter Function',
    listName: 'Custom + filterCreator function',
    color: '#00FF00',
    features: [
      point([106.1892014954, 20.943262715], {
        code: 'ANIM001',
        type: 'important',
        status: 'active',
        priority: 1,
      }),
      line(
        [
          [106.0804053203, 20.7274626545],
          [106.2036647594, 20.9247777007],
          [106.0563288258, 20.9155343387],
        ],
        {
          code: 'ANIM002',
          type: 'important',
          status: 'active',
          priority: 2,
        },
      ),
      polygon(
        [
          [
            [106.1475326507, 20.6369404209],
            [106.3212571097, 20.6369404209],
            [106.3212571097, 20.7192355919],
            [106.1475326507, 20.7192355919],
            [106.1475326507, 20.6369404209],
          ],
        ],
        {
          code: 'ANIM003',
          type: 'normal',
          status: 'inactive',
          priority: 3,
        },
      ),
      polygon(
        [
          [
            [106.2475326507, 20.7369404209],
            [106.4212571097, 20.7369404209],
            [106.4212571097, 20.8192355919],
            [106.2475326507, 20.8192355919],
            [106.2475326507, 20.7369404209],
          ],
        ],
        {
          code: 'ANIM004',
          type: 'important',
          status: 'active',
          priority: 1,
        },
      ),
    ],
    highlight: createDatasetCustomHighlightComponent(undefined, {
      filterCreator: () => [
        'all',
        ['==', 'type', 'important'],
        ['==', 'status', 'active'],
        ['<=', 'priority', 2],
      ],
    }),
  });
}

function createDefaultHighlightWithFilterFunction() {
  return createHighlightDemoDataset({
    name: 'Default Highlight with Filter Function',
    listName: 'Default + filterCreator function',
    color: '#FF6600',
    features: [
      point([105.8892014954, 20.843262715], {
        category: 'building',
        status: 'active',
        priority: 'high',
        code: 'BLD001',
      }),
      line(
        [
          [105.7804053203, 20.6274626545],
          [106.0036647594, 20.8247777007],
          [105.8563288258, 20.8155343387],
        ],
        {
          category: 'road',
          status: 'active',
          priority: 'medium',
          code: 'ROD002',
        },
      ),
      polygon(
        [
          [
            [105.8475326507, 20.5369404209],
            [106.0212571097, 20.5369404209],
            [106.0212571097, 20.6192355919],
            [105.8475326507, 20.6192355919],
            [105.8475326507, 20.5369404209],
          ],
        ],
        {
          category: 'park',
          status: 'inactive',
          priority: 'low',
          code: 'PRK003',
        },
      ),
      polygon(
        [
          [
            [105.9475326507, 20.6369404209],
            [106.1212571097, 20.6369404209],
            [106.1212571097, 20.7192355919],
            [105.9475326507, 20.7192355919],
            [105.9475326507, 20.6369404209],
          ],
        ],
        {
          category: 'building',
          status: 'active',
          priority: 'high',
          code: 'BLD004',
        },
      ),
    ],
    highlight: createDatasetPartHighlightComponent(undefined, {
      filterCreator: () => [
        'all',
        ['==', 'category', 'building'],
        ['==', 'status', 'active'],
        ['==', 'priority', 'high'],
      ],
    }),
  });
}

function createCustomAnimateWithFieldName() {
  return createHighlightDemoDataset({
    name: 'Custom Animate with Field Name',
    listName: 'Custom + filterCreator "productCode"',
    color: '#9900FF',
    features: [
      point([106.0892014954, 20.943262715], {
        productCode: 'PRD001',
        name: 'Product A',
      }),
      line(
        [
          [105.9804053203, 20.7274626545],
          [106.2036647594, 20.9247777007],
          [106.0563288258, 20.9155343387],
        ],
        { productCode: 'PRD002', name: 'Product B' },
      ),
      polygon(
        [
          [
            [106.1475326507, 20.6369404209],
            [106.3212571097, 20.6369404209],
            [106.3212571097, 20.7192355919],
            [106.1475326507, 20.7192355919],
            [106.1475326507, 20.6369404209],
          ],
        ],
        { productCode: 'PRD003', name: 'Product C' },
      ),
    ],
    highlight: createDatasetCustomHighlightComponent(undefined, {
      filterCreator: 'productCode',
    }),
  });
}

function createShadowWithPropertyFilter() {
  return createHighlightDemoDataset({
    name: 'Shadow with Property Filter',
    listName: 'Shadow + filterCreator "code"',
    features: [
      point([105.2, 20.75], { code: 'SH-1', name: 'Shadow point' }),
      line(
        [
          [105.1, 20.7],
          [105.3, 20.8],
        ],
        { code: 'SH-2', name: 'Shadow line' },
      ),
      polygon(
        [
          [
            [105.15, 20.62],
            [105.32, 20.62],
            [105.32, 20.72],
            [105.15, 20.72],
            [105.15, 20.62],
          ],
        ],
        { code: 'SH-3', name: 'Shadow area' },
      ),
    ],
    highlight: createDatasetPartShadowHighlightComponent('#00B4D8', undefined, {
      filterCreator: 'code',
    }),
  });
}

function createHighlightByClickedCategory() {
  return createHighlightDemoDataset({
    name: 'Highlight by clicked category',
    listName: 'Default + filterCreator(feature)',
    color: '#2A9D8F',
    features: [
      point([105.72, 21.05], { id: '1', category: 'A', name: 'Category A point' }),
      point([105.8, 21.08], { id: '2', category: 'A', name: 'Category A point 2' }),
      line(
        [
          [105.65, 21.0],
          [105.82, 21.08],
        ],
        { id: '3', category: 'B', name: 'Category B line' },
      ),
      polygon(
        [
          [
            [105.68, 20.92],
            [105.84, 20.92],
            [105.84, 21.02],
            [105.68, 21.02],
            [105.68, 20.92],
          ],
        ],
        { id: '4', category: 'B', name: 'Category B area' },
      ),
    ],
    highlight: createDatasetPartHighlightComponent(undefined, {
      filterCreator: (feature) => {
        const category = feature?.properties?.category;
        if (typeof category !== 'string') return undefined;
        return ['==', 'category', category];
      },
    }),
  });
}

function createFeatureStateHighlight() {
  return createHighlightDemoDataset({
    name: 'Feature state Highlight',
    listName: 'Feature state highlight',
    color: '#E63946',
    promoteId: 'id',
    features: [
      point([105.95, 21.18], { id: 'fs-1', name: 'State point' }),
      line(
        [
          [105.88, 21.12],
          [106.05, 21.2],
        ],
        { id: 'fs-2', name: 'State line' },
      ),
      polygon(
        [
          [
            [105.9, 21.05],
            [106.08, 21.05],
            [106.08, 21.16],
            [105.9, 21.16],
            [105.9, 21.05],
          ],
        ],
        { id: 'fs-3', name: 'State area' },
      ),
    ],
    highlight: createDatasetPartFeatureStateHighlightComponent('#E63946'),
  });
}

function createFeatureStateHighlightWithGroup() {
  return createHighlightDemoDataset({
    name: 'Feature state with group',
    listName: 'Feature state + filterCreator "group"',
    color: '#9B5DE5',
    promoteId: 'id',
    features: [
      point([106.22, 21.05], { id: 'g-1', group: 'alpha', name: 'Group A point' }),
      point([106.28, 21.08], { id: 'g-2', group: 'alpha', name: 'Group A point 2' }),
      line(
        [
          [106.18, 20.98],
          [106.32, 21.06],
        ],
        { id: 'g-3', group: 'beta', name: 'Group B line' },
      ),
      polygon(
        [
          [
            [106.18, 20.88],
            [106.34, 20.88],
            [106.34, 20.98],
            [106.18, 20.98],
            [106.18, 20.88],
          ],
        ],
        { id: 'g-4', group: 'alpha', name: 'Group A area' },
      ),
    ],
    highlight: createDatasetPartFeatureStateHighlightComponent('#9B5DE5', undefined, {
      filterCreator: 'group',
    }),
  });
}
