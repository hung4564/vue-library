import { getChartRandomColor } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import {
  createDatasetPartListViewUiComponentBuilder,
  createGroupDataset,
  createMultiMapboxLayerComponent,
  createRootDataset,
} from '@hungpvq/map-dataset';
import { createDatasetPartGeojsonSourceComponent } from '@hungpvq/map-dataset/geojson';
import {
  createHighlightPart,
  type IHighlightPart,
} from '@hungpvq/map-dataset/highlight';
import {
  createMenuItemShowDetailForItem,
  createMenuItemToBoundActionForList,
  createMenuItemToggleShow,
} from '@hungpvq/map-dataset/menu';
import { LayerSimpleMapboxBuild } from '@hungpvq/map-dataset/style';
import { loggerFactory } from '@hungpvq/shared-log';
import type { Feature } from 'geojson';
import { demoLine, demoPoint, demoPolygon } from '../../fixtures/geojson';
import { registerFactoryViewSource } from '../data-management/view-source-registry';
import { createDatasetCustomHighlightComponent } from './helper';

const logger = loggerFactory
  .createLogger()
  .setNamespace('demo:highlight', 2);

const DEMO_DETAIL_FIELDS = [
  { text: 'Id', value: 'id' },
  { text: 'Name', value: 'name' },
];

function createHighlightDemoDataset(config: {
  name: string;
  listName: string;
  color?: string;
  features: Feature[];
  highlight: IHighlightPart;
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
    .addMenus([
      createMenuItemToggleShow(),
      createMenuItemToBoundActionForList(),
      createMenuItemShowDetailForItem(DEMO_DETAIL_FIELDS),
    ])
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
    createReplaceScopeAllHighlight(),
    createPresentationLifecycleHighlight(),
    createPointerClickOnlyHighlight(),
    createPointerHoverOnlyHighlight(),
    createPointerBothHighlight(),
  ];
}

function createDefaultHighlight() {
  return createHighlightDemoDataset({
    name: 'Default Highlight',
    listName: 'Default highlight (blink + id)',
    features: [
      demoPoint([105.7892014954, 20.943262715], { id: '1' }),
      demoLine(
        [
          [105.7804053203, 20.7274626545],
          [106.1036647594, 20.9247777007],
          [105.9563288258, 20.9155343387],
          [105.7705084952, 20.8590333097],
          [105.6506620321, 20.8693077491],
        ],
        { id: '2' },
      ),
      demoPolygon(
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
    highlight: createHighlightPart({
      // click → MapLibre popup; hover → paint only
      presentation: { clickAction: 'popup' },
    }),
  });
}

function createShadowHighlight() {
  return createHighlightDemoDataset({
    name: 'Shadow Highlight',
    listName: 'Shadow highlight (static glow)',
    features: [
      demoPoint([105.45, 20.55], { id: '1' }),
      demoLine(
        [
          [105.35, 20.5],
          [105.55, 20.58],
          [105.48, 20.48],
        ],
        { id: '2' },
      ),
      demoPolygon(
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
    highlight: createHighlightPart({ mode: 'outline', color: '#FFB703' }),
  });
}

function createChangeColorHighlight() {
  return createHighlightDemoDataset({
    name: 'Change color Highlight',
    listName: 'Change color highlight',
    features: [
      demoPoint([105.6108155623, 21.1273787081], { id: '1' }),
      demoLine(
        [
          [105.3015095688, 21.0955507976],
          [105.1738176473, 21.0152685258],
          [105.2810742254, 20.9760077447],
          [105.3712445705, 21.0634566382],
        ],
        { id: '2' },
      ),
      demoPolygon(
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
    highlight: createHighlightPart({ mode: 'changeColor' }),
  });
}

function createCustomHighlight() {
  return createHighlightDemoDataset({
    name: 'Custom Highlight',
    listName: 'Custom animate highlight',
    color: '#0000FF',
    features: [
      demoPoint([106.1128036314, 21.1891301922], { id: '1' }),
      demoLine(
        [
          [106.2285487367, 21.2142605019],
          [106.3443667242, 21.2184735353],
          [106.3499660516, 21.1618706472],
          [106.2510678488, 21.1346188642],
        ],
        { id: '3' },
      ),
      demoPolygon(
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
      demoPoint([105.8892014954, 20.743262715], { code: 'P001', name: 'Point 1' }),
      demoLine(
        [
          [105.7804053203, 20.5274626545],
          [106.0036647594, 20.7247777007],
          [105.8563288258, 20.7155343387],
        ],
        { code: 'L002', name: 'Line 2' },
      ),
      demoPolygon(
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
    highlight: createHighlightPart({ filterCreator: 'code' }),
  });
}

function createHighlightWithExplicitIdField() {
  return createHighlightDemoDataset({
    name: 'Highlight filterCreator id',
    listName: 'Default + filterCreator "id"',
    features: [
      demoPoint([105.55, 21.02], { id: 'id-1', name: 'Point' }),
      demoLine(
        [
          [105.5, 20.98],
          [105.65, 21.05],
        ],
        { id: 'id-2', name: 'Line' },
      ),
      demoPolygon(
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
    highlight: createHighlightPart({ filterCreator: 'id' }),
  });
}

function createCustomAnimateWithFilterFunction() {
  return createHighlightDemoDataset({
    name: 'Custom Animate with Filter Function',
    listName: 'Custom + filterCreator function',
    color: '#00FF00',
    features: [
      demoPoint([106.1892014954, 20.943262715], {
        code: 'ANIM001',
        type: 'important',
        status: 'active',
        priority: 1,
      }),
      demoLine(
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
      demoPolygon(
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
      demoPolygon(
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
    highlight: createDatasetCustomHighlightComponent({
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
      demoPoint([105.8892014954, 20.843262715], {
        category: 'building',
        status: 'active',
        priority: 'high',
        code: 'BLD001',
      }),
      demoLine(
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
      demoPolygon(
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
      demoPolygon(
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
    highlight: createHighlightPart({
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
      demoPoint([106.0892014954, 20.943262715], {
        productCode: 'PRD001',
        name: 'Product A',
      }),
      demoLine(
        [
          [105.9804053203, 20.7274626545],
          [106.2036647594, 20.9247777007],
          [106.0563288258, 20.9155343387],
        ],
        { productCode: 'PRD002', name: 'Product B' },
      ),
      demoPolygon(
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
    highlight: createDatasetCustomHighlightComponent({
      filterCreator: 'productCode',
    }),
  });
}

function createShadowWithPropertyFilter() {
  return createHighlightDemoDataset({
    name: 'Shadow with Property Filter',
    listName: 'Shadow + filterCreator "code"',
    features: [
      demoPoint([105.2, 20.75], { code: 'SH-1', name: 'Shadow point' }),
      demoLine(
        [
          [105.1, 20.7],
          [105.3, 20.8],
        ],
        { code: 'SH-2', name: 'Shadow line' },
      ),
      demoPolygon(
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
    highlight: createHighlightPart({
      mode: 'outline',
      color: '#00B4D8',
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
      demoPoint([105.72, 21.05], { id: '1', category: 'A', name: 'Category A point' }),
      demoPoint([105.8, 21.08], { id: '2', category: 'A', name: 'Category A point 2' }),
      demoLine(
        [
          [105.65, 21.0],
          [105.82, 21.08],
        ],
        { id: '3', category: 'B', name: 'Category B line' },
      ),
      demoPolygon(
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
    highlight: createHighlightPart({
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
      demoPoint([105.95, 21.18], { id: 'fs-1', name: 'State point' }),
      demoLine(
        [
          [105.88, 21.12],
          [106.05, 21.2],
        ],
        { id: 'fs-2', name: 'State line' },
      ),
      demoPolygon(
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
    // Local GeoJSON: pulse paint (promoteId stays on source)
    highlight: createHighlightPart({ mode: 'pulse', color: '#E63946' }),
  });
}

function createFeatureStateHighlightWithGroup() {
  return createHighlightDemoDataset({
    name: 'Feature state with group',
    listName: 'Feature state + filterCreator "group"',
    color: '#9B5DE5',
    promoteId: 'id',
    features: [
      demoPoint([106.22, 21.05], { id: 'g-1', group: 'alpha', name: 'Group A point' }),
      demoPoint([106.28, 21.08], { id: 'g-2', group: 'alpha', name: 'Group A point 2' }),
      demoLine(
        [
          [106.18, 20.98],
          [106.32, 21.06],
        ],
        { id: 'g-3', group: 'beta', name: 'Group B line' },
      ),
      demoPolygon(
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
    highlight: createHighlightPart({
      mode: 'pulse',
      color: '#9B5DE5',
      filterCreator: 'group',
    }),
  });
}

/** #15 — wipe every highlight source when a new feature is shown */
function createReplaceScopeAllHighlight() {
  return createHighlightDemoDataset({
    name: 'Replace scope all',
    listName: 'Selection replaceScope all (multiple)',
    color: '#F4A261',
    features: [
      demoPoint([105.15, 21.22], { id: 'rs-1', name: 'Replace scope point' }),
      demoLine(
        [
          [105.05, 21.15],
          [105.25, 21.25],
        ],
        { id: 'rs-2', name: 'Replace scope line' },
      ),
      demoPolygon(
        [
          [
            [105.08, 21.05],
            [105.28, 21.05],
            [105.28, 21.18],
            [105.08, 21.18],
            [105.08, 21.05],
          ],
        ],
        { id: 'rs-3', name: 'Replace scope area' },
      ),
    ],
    highlight: createHighlightPart({
      selection: { policy: 'multiple', replaceScope: 'all' },
    }),
  });
}

/** #16 — presentation lifecycle callbacks (no MapLibre popup) */
function createPresentationLifecycleHighlight() {
  return createHighlightDemoDataset({
    name: 'Presentation lifecycle',
    listName: 'Presentation onShow / onHide',
    color: '#264653',
    features: [
      demoPoint([106.4, 21.22], { id: 'pr-1', name: 'Lifecycle point' }),
      demoLine(
        [
          [106.3, 21.15],
          [106.5, 21.25],
        ],
        { id: 'pr-2', name: 'Lifecycle line' },
      ),
      demoPolygon(
        [
          [
            [106.32, 21.05],
            [106.52, 21.05],
            [106.52, 21.18],
            [106.32, 21.18],
            [106.32, 21.05],
          ],
        ],
        { id: 'pr-3', name: 'Lifecycle area' },
      ),
    ],
    highlight: createHighlightPart({
      presentation: {
        popup: { kind: 'none' },
        clickAction: 'none',
        onShow: (entry) => {
          logger.info('highlight onShow', {
            id: entry.id,
            source: entry.source,
          });
        },
        onHide: (entry) => {
          logger.info('highlight onHide', {
            id: entry.id,
            source: entry.source,
          });
        },
      },
    }),
  });
}

/** #17 — click-only / hover-only / both pointer policies */
function createPointerClickOnlyHighlight() {
  return createHighlightDemoDataset({
    name: 'Pointer click-only',
    listName: 'Pointer click → detail',
    color: '#E76F51',
    features: [
      demoPoint([105.35, 21.35], { id: 'pc-1', name: 'Click-only point' }),
      demoLine(
        [
          [105.25, 21.28],
          [105.45, 21.38],
        ],
        { id: 'pc-2', name: 'Click-only line' },
      ),
      demoPolygon(
        [
          [
            [105.28, 21.18],
            [105.48, 21.18],
            [105.48, 21.3],
            [105.28, 21.3],
            [105.28, 21.18],
          ],
        ],
        { id: 'pc-3', name: 'Click-only area' },
      ),
    ],
    highlight: createHighlightPart({
      color: '#E76F51',
      pointer: { click: true, hover: false },
      // Click opens LayerDetail (needs showDetail menu on the list).
      presentation: { clickAction: 'detail' },
    }),
  });
}

function createPointerHoverOnlyHighlight() {
  return createHighlightDemoDataset({
    name: 'Pointer hover-only',
    listName: 'Pointer hover-only',
    color: '#2A9D8F',
    features: [
      demoPoint([105.65, 21.35], { id: 'ph-1', name: 'Hover-only point' }),
      demoLine(
        [
          [105.55, 21.28],
          [105.75, 21.38],
        ],
        { id: 'ph-2', name: 'Hover-only line' },
      ),
      demoPolygon(
        [
          [
            [105.58, 21.18],
            [105.78, 21.18],
            [105.78, 21.3],
            [105.58, 21.3],
            [105.58, 21.18],
          ],
        ],
        { id: 'ph-3', name: 'Hover-only area' },
      ),
    ],
    highlight: createHighlightPart({
      color: '#2A9D8F',
      pointer: { click: false, hover: true },
      presentation: { clickAction: 'none' },
    }),
  });
}

function createPointerBothHighlight() {
  return createHighlightDemoDataset({
    name: 'Pointer both',
    listName: 'Pointer both (default)',
    color: '#457B9D',
    features: [
      demoPoint([105.95, 21.35], { id: 'pb-1', name: 'Both point' }),
      demoLine(
        [
          [105.85, 21.28],
          [106.05, 21.38],
        ],
        { id: 'pb-2', name: 'Both line' },
      ),
      demoPolygon(
        [
          [
            [105.88, 21.18],
            [106.08, 21.18],
            [106.08, 21.3],
            [105.88, 21.3],
            [105.88, 21.18],
          ],
        ],
        { id: 'pb-3', name: 'Both area' },
      ),
    ],
    highlight: createHighlightPart({
      color: '#457B9D',
      // Hover paints only; click paints + MapLibre popup.
      presentation: { clickAction: 'popup' },
    }),
  });
}

export const HIGHLIGHT_DEMO_DATASET_FACTORIES = [
  createDefaultHighlight,
  createShadowHighlight,
  createChangeColorHighlight,
  createCustomHighlight,
  createHighlightWithPropertyName,
  createHighlightWithExplicitIdField,
  createCustomAnimateWithFilterFunction,
  createDefaultHighlightWithFilterFunction,
  createCustomAnimateWithFieldName,
  createShadowWithPropertyFilter,
  createHighlightByClickedCategory,
  createFeatureStateHighlight,
  createFeatureStateHighlightWithGroup,
  createReplaceScopeAllHighlight,
  createPresentationLifecycleHighlight,
  createPointerClickOnlyHighlight,
  createPointerHoverOnlyHighlight,
  createPointerBothHighlight,
] as const;

export { HIGHLIGHT_DEMO_HELP_SECTIONS } from './help';

const HIGHLIGHT_VIEW_SOURCE: Array<{
  listName: string;
  title: string;
  factory: () => IDataset;
}> = [
  {
    listName: 'Default highlight (blink + id)',
    title: 'Highlight demo — default blink',
    factory: createDefaultHighlight,
  },
  {
    listName: 'Shadow highlight (static glow)',
    title: 'Highlight demo — shadow',
    factory: createShadowHighlight,
  },
  {
    listName: 'Change color highlight',
    title: 'Highlight demo — change color',
    factory: createChangeColorHighlight,
  },
  {
    listName: 'Custom animate highlight',
    title: 'Highlight demo — custom animate',
    factory: createCustomHighlight,
  },
  {
    listName: 'Default + filterCreator "code"',
    title: 'Highlight demo — filter by code',
    factory: createHighlightWithPropertyName,
  },
  {
    listName: 'Default + filterCreator "id"',
    title: 'Highlight demo — filter by id',
    factory: createHighlightWithExplicitIdField,
  },
  {
    listName: 'Custom + filterCreator function',
    title: 'Highlight demo — custom + filter fn',
    factory: createCustomAnimateWithFilterFunction,
  },
  {
    listName: 'Default + filterCreator function',
    title: 'Highlight demo — default + filter fn',
    factory: createDefaultHighlightWithFilterFunction,
  },
  {
    listName: 'Custom + filterCreator "productCode"',
    title: 'Highlight demo — productCode field',
    factory: createCustomAnimateWithFieldName,
  },
  {
    listName: 'Shadow + filterCreator "code"',
    title: 'Highlight demo — shadow + code',
    factory: createShadowWithPropertyFilter,
  },
  {
    listName: 'Default + filterCreator(feature)',
    title: 'Highlight demo — filter from clicked feature',
    factory: createHighlightByClickedCategory,
  },
  {
    listName: 'Feature state highlight',
    title: 'Highlight demo — feature-state',
    factory: createFeatureStateHighlight,
  },
  {
    listName: 'Feature state + filterCreator "group"',
    title: 'Highlight demo — feature-state + group',
    factory: createFeatureStateHighlightWithGroup,
  },
  {
    listName: 'Selection replaceScope all (multiple)',
    title: 'Highlight demo — replaceScope all',
    factory: createReplaceScopeAllHighlight,
  },
  {
    listName: 'Presentation onShow / onHide',
    title: 'Highlight demo — presentation lifecycle',
    factory: createPresentationLifecycleHighlight,
  },
  {
    listName: 'Pointer click → detail',
    title: 'Highlight demo — click opens LayerDetail',
    factory: createPointerClickOnlyHighlight,
  },
  {
    listName: 'Pointer hover-only',
    title: 'Highlight demo — pointer hover-only',
    factory: createPointerHoverOnlyHighlight,
  },
  {
    listName: 'Pointer both (default)',
    title: 'Highlight demo — pointer both',
    factory: createPointerBothHighlight,
  },
];

for (const entry of HIGHLIGHT_VIEW_SOURCE) {
  registerFactoryViewSource(entry);
}
