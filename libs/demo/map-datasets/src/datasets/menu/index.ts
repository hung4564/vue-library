import { getChartRandomColor } from '@hungpvq/map-core';
import {
  createDatasetPartBoundComponent,
  createDatasetPartGeojsonSourceComponent,
  createDatasetPartHighlightComponent,
  createDatasetPartIdentifyComponentBuilder,
  createDatasetPartListViewUiComponentBuilder,
  createDatasetPartMenuComponentBuilder,
  createGroupDataset,
  createMenuBuilder,
  createMenuClickBuilder,
  createMenuClickHighlightBuilder,
  createMenuItemIdentifyForList,
  createMenuItemShowDetailForItem,
  createMenuItemShowDetailInfoSource,
  createMenuItemStyleEdit,
  createMenuItemToBoundActionForItem,
  createMenuItemToBoundActionForList,
  createMenuItemToggleShow,
  createMultiMapboxLayerComponent,
  createRootDataset,
  LayerSimpleMapboxBuild,
  LIST_VIEW_MENU_ID,
  type MenuItemClick,
} from '@hungpvq/map-dataset';
import {
  mdiAppleKeyboardCommand,
  mdiCrosshairsGps,
  mdiMarker,
  mdiPen,
  mdiRegisteredTrademark,
  mdiUpdate,
} from '@mdi/js';
import {
  DEMO_BBOX,
  DEMO_LIST_BBOX,
  DEMO_POLYGON,
  demoPoint,
  demoPolygon,
} from '../../fixtures/geojson';
import {
  DEMO_CUSTOM_MENU_HANDLER_KEY,
  DEMO_LAYER_TOGGLE_SHOW_KEY,
} from '../../registry/menu-handlers';

function createCustomMenuItem(
  icon: string,
  name: string,
  click: MenuItemClick,
) {
  return createMenuBuilder()
    .item()
    .setLocation('extra')
    .setName(name)
    .setIcon(icon)
    .setClick(click)
    .build();
}

function createCustomWithTransformMenuItem(
  icon: string,
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

export function createDefaultMenuSupportDataset() {
  const dataset = createRootDataset('Default menu support');
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [DEMO_POLYGON],
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
      createMenuItemToBoundActionForList({ bbox: DEMO_BBOX }),
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

/** Separate layer: Fill bound reads bound part; Update bbox toggles getData(). */
export function createDynamicBoundMenuDataset() {
  const name = 'Dynamic bound (update bbox)';
  const dataset = createRootDataset(name);
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [DEMO_POLYGON],
  });
  const bound = createDatasetPartBoundComponent(name, DEMO_BBOX);
  const groupLayer = createGroupDataset(name);
  const list = createDatasetPartListViewUiComponentBuilder(name)
    .setColor(getChartRandomColor())
    .configDisabledDelete()
    .addMenus([
      createMenuItemToggleShow(),
      createMenuItemToBoundActionForList(),
      createCustomMenuItem(
        mdiUpdate,
        'Update bbox',
        createMenuClickBuilder()
          .addCommand(() => {
            const current = bound.getData();
            const next =
              current[0] === DEMO_BBOX[0] ? DEMO_LIST_BBOX : DEMO_BBOX;
            bound.setData(next);
            console.info('bound bbox updated', next);
          })
          .build(),
      ),
    ])
    .build();
  const layer = createMultiMapboxLayerComponent('layer', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list.color)
      .build(),
  ]);
  groupLayer.add(layer);
  groupLayer.add(list);
  dataset.add(source);
  dataset.add(bound);
  dataset.add(groupLayer);
  return dataset;
}

/** Layer with identify sibling: Identify icon (extra) + ⋮ row (menu). */
export function createIdentifyMenuDataset() {
  const name = 'Layer identify menu';
  const dataset = createRootDataset(name);
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [DEMO_POLYGON],
  });
  const groupLayer = createGroupDataset(name);
  const list = createDatasetPartListViewUiComponentBuilder(name)
    .setColor(getChartRandomColor())
    .configDisabledDelete()
    .addMenus([
      createMenuItemToggleShow(),
      createMenuItemIdentifyForList(),
      createMenuItemIdentifyForList({ location: 'menu' }),
    ])
    .build();
  const layer = createMultiMapboxLayerComponent('layer', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list.color)
      .build(),
  ]);
  const identify = createDatasetPartIdentifyComponentBuilder(name).build();
  groupLayer.add(layer);
  groupLayer.add(list);
  dataset.add(source);
  dataset.add(groupLayer);
  dataset.add(identify);
  return dataset;
}

/** Default menus on a shared `menu` part: list uses `for: 'layer'`, identify/table use `for: 'item'`. */
export function createSharedDatasetMenuDataset() {
  const name = 'Shared dataset menus';
  const dataset = createRootDataset(name);
  const features = [
    demoPolygon(
      [
        [
          [105.8, 21.0],
          [105.8, 21.06],
          [105.9, 21.06],
          [105.9, 21.0],
          [105.8, 21.0],
        ],
      ],
      { id: 'shared-area-1', name: 'Hoan Kiem area', kind: 'area' },
    ),
    demoPolygon(
      [
        [
          [105.78, 20.98],
          [105.78, 21.02],
          [105.84, 21.02],
          [105.84, 20.98],
          [105.78, 20.98],
        ],
      ],
      { id: 'shared-area-2', name: 'Ba Dinh area', kind: 'area' },
    ),
    demoPoint([105.852, 21.028], {
      id: 'shared-point-1',
      name: 'Hoan Kiem Lake',
      kind: 'point',
    }),
    demoPoint([105.834, 21.037], {
      id: 'shared-point-2',
      name: 'Ho Chi Minh Mausoleum',
      kind: 'point',
    }),
  ];
  const bbox: [number, number, number, number] = [
    105.78, 20.98, 105.9, 21.06,
  ];
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features,
  });
  const bound = createDatasetPartBoundComponent(name, bbox);
  const menus = createDatasetPartMenuComponentBuilder(name)
    .addLayerMenu(createMenuItemToggleShow(), LIST_VIEW_MENU_ID.layer.toggleShow)
    .addLayerMenu(createMenuItemShowDetailInfoSource(), LIST_VIEW_MENU_ID.layer.info)
    .addLayerMenu(
      createMenuItemToBoundActionForList(),
      LIST_VIEW_MENU_ID.layer.fillBound,
    )
    .addItemMenu(
      createMenuItemShowDetailForItem([
        { text: 'Id', value: 'id' },
        { text: 'Name', value: 'name' },
        { text: 'Kind', value: 'kind' },
      ]),
      LIST_VIEW_MENU_ID.item.showDetail,
    )
    .addItemMenu(
      createMenuItemToBoundActionForItem(),
      LIST_VIEW_MENU_ID.item.flyTo,
    )
    .build();
  const groupLayer = createGroupDataset(name);
  const list = createDatasetPartListViewUiComponentBuilder(name)
    .setColor(getChartRandomColor())
    .configDisabledDelete()
    .addMenus([createMenuItemIdentifyForList()])
    .build();
  const layerArea = createMultiMapboxLayerComponent('layer area', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list.color)
      .setFilter(['==', '$type', 'Polygon'])
      .build(),
  ]);
  const layerPoint = createMultiMapboxLayerComponent('layer point', [
    new LayerSimpleMapboxBuild()
      .setStyleType('point')
      .setColor(list.color)
      .setFilter(['==', '$type', 'Point'])
      .build(),
  ]);
  const highlight = createDatasetPartHighlightComponent();
  const identify = createDatasetPartIdentifyComponentBuilder(name)
    .configFieldId('id')
    .configFieldName('name')
    .preferResultControl()
    .build();
  groupLayer.add(layerArea);
  groupLayer.add(layerPoint);
  groupLayer.add(highlight);
  groupLayer.add(list);
  dataset.add(source);
  dataset.add(bound);
  dataset.add(menus);
  dataset.add(groupLayer);
  dataset.add(identify);
  return dataset;
}

export function createCustomSupportDataset() {
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
          .addTupleStatic(LIST_VIEW_MENU_ID.fitBounds, { value: DEMO_BBOX })
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
        createMenuClickBuilder()
          .addCommand(DEMO_CUSTOM_MENU_HANDLER_KEY)
          .build(),
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
      createCustomWithTransformMenuItem(
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
              return { value: 'custom' };
            },
          )
          .build(),
      ),
      createCustomWithTransformMenuItem(
        mdiRegisteredTrademark,
        'custom use registry and transform',
        createMenuClickBuilder()
          .addTupleDynamic(DEMO_CUSTOM_MENU_HANDLER_KEY, (props) => {
            alert('custom use registry and transform');
            console.info('custom use registry and transform', props);
            return { value: 'custom' };
          })
          .build(),
      ),
      createCustomWithTransformMenuItem(
        mdiMarker,
        'custom use menu fitBounds and transform',
        createMenuClickBuilder()
          .addTupleDynamic(LIST_VIEW_MENU_ID.highlight, (props) => {
            alert('custom use menu fitBounds and transform');
            console.info('custom use menu fitBounds and transform', props);
            return {
              value: createMenuClickHighlightBuilder()
                .setDetail(DEMO_POLYGON)
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

export function createCustomMultiSupportDataset() {
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
          .addCommand(DEMO_CUSTOM_MENU_HANDLER_KEY)
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
              return { value: 'custom' };
            },
          )
          .addTupleDynamic(DEMO_CUSTOM_MENU_HANDLER_KEY, (props) => {
            console.info('custom use registry and transform', props);
            return { value: 'custom' };
          })
          .addTupleDynamic(LIST_VIEW_MENU_ID.highlight, (props) => {
            console.info('custom use menu fitBounds and transform', props);
            return {
              value: createMenuClickHighlightBuilder()
                .setDetail(DEMO_POLYGON)
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

export function createCustomChainSupportDataset() {
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

/** Layer with a custom ToggleShow component (override menu componentKey). */
export function createCustomToggleButtonDataset() {
  const name = 'Custom toggle button (per layer)';
  const dataset = createRootDataset(name);
  const features = [
    demoPolygon(
      [
        [
          [106.15, 20.55],
          [106.15, 20.68],
          [106.32, 20.68],
          [106.32, 20.55],
          [106.15, 20.55],
        ],
      ],
      { id: 'toggle-area-1', name: 'Custom toggle area' },
    ),
    demoPoint([106.235, 20.615], {
      id: 'toggle-point-1',
      name: 'Custom toggle point',
    }),
  ];
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features,
  });
  const bbox: [number, number, number, number] = [
    106.15, 20.55, 106.32, 20.68,
  ];
  const bound = createDatasetPartBoundComponent(name, bbox);
  const groupLayer = createGroupDataset(name);
  const list = createDatasetPartListViewUiComponentBuilder(name)
    .setColor('#2a9d8f')
    .configDisabledDelete()
    .addMenus([
      createMenuItemToggleShow({
        componentKey: DEMO_LAYER_TOGGLE_SHOW_KEY,
      }),
      createMenuItemStyleEdit(),
      createMenuItemShowDetailInfoSource(),
      createMenuItemToBoundActionForList({ bbox }),
    ])
    .build();
  const layerArea = createMultiMapboxLayerComponent('layer area', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list.color)
      .setOpacity(0.55)
      .setFilter(['==', '$type', 'Polygon'])
      .build(),
  ]);
  const layerPoint = createMultiMapboxLayerComponent('layer point', [
    new LayerSimpleMapboxBuild()
      .setStyleType('point')
      .setColor(list.color)
      .setFilter(['==', '$type', 'Point'])
      .build(),
  ]);
  groupLayer.add(layerArea);
  groupLayer.add(layerPoint);
  groupLayer.add(list);
  dataset.add(source);
  dataset.add(bound);
  dataset.add(groupLayer);
  return dataset;
}

export const MENU_DEMO_DATASET_FACTORIES = [
  createDefaultMenuSupportDataset,
  createCustomToggleButtonDataset,
  createDynamicBoundMenuDataset,
  createIdentifyMenuDataset,
  createSharedDatasetMenuDataset,
  createCustomSupportDataset,
  createCustomMultiSupportDataset,
  createCustomChainSupportDataset,
] as const;
