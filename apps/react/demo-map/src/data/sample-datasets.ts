import { getChartRandomColor } from '@hungpvq/map-core';
import {
  createDatasetPartGeojsonSourceComponent,
  createDatasetPartHighlightComponent,
  createDatasetPartIdentifyComponentBuilder,
  createDatasetPartListViewUiComponentBuilder,
  createGroupDataset,
  createMenuBuilder,
  createMenuClickBuilder,
  createMenuClickHighlightBuilder,
  createMenuItemShowDetailForItem,
  createMenuItemShowDetailInfoSource,
  createMenuItemStyleEdit,
  createMenuItemToBoundActionForItem,
  createMenuItemToBoundActionForList,
  createMenuItemToggleShow,
  createMultiMapboxLayerComponent,
  createRootDataset,
  LayerSimpleMapboxBuild,
  type MenuItemClick,
  type MenuItemProps,
} from '@hungpvq/map-dataset';
import { UniversalRegistry } from '@hungpvq/react-map-core';
import { createMultiLegend } from '@hungpvq/react-map-dataset';
import {
  mdiAppleKeyboardCommand,
  mdiCrosshairsGps,
  mdiMarker,
  mdiPen,
  mdiRegisteredTrademark,
  mdiStar,
} from '@mdi/js';
import { addDatasetToMap } from './dataset-utils';

const DEMO_POLYGON = {
  type: 'Feature' as const,
  properties: { id: '3' },
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
    type: 'Polygon' as const,
  },
};

const DEMO_BBOX: [number, number, number, number] = [
  105.94753265070807, 20.636940420905717, 106.12125710970412,
  20.719235591893252,
];

let menuHandlerRegistered = false;

function ensureCustomMenuHandler() {
  if (menuHandlerRegistered) return;
  menuHandlerRegistered = true;
  UniversalRegistry.registerMenuHandler(
    'custom-menu-handle',
    (props: MenuItemProps) => {
      console.info('custom-menu-handle in registry', props);
    },
  );
}

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

function createSimpleIdentifyDataset() {
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
  const identify = createDatasetPartIdentifyComponentBuilder('Simple identify')
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

function createIdentifyWithMenuDataset() {
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

function createDefaultListDataset() {
  const dataset = createRootDataset('Default');
  const list1 =
    createDatasetPartListViewUiComponentBuilder('Default list').build();
  dataset.add(list1);
  return dataset;
}

function createCustomColorListDataset() {
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

function createListWithMenuDataset() {
  const dataset = createRootDataset('Default custom simple');
  const list1 = createDatasetPartListViewUiComponentBuilder('Custom menu list')
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

function createDefaultMenuSupportDataset() {
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
          .addTupleStatic('fitBounds', { value: DEMO_BBOX })
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
          .addTupleDynamic('custom-menu-handle', (props) => {
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
          .addTupleDynamic('highlight', (props) => {
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
              return { value: 'custom' };
            },
          )
          .addTupleDynamic('custom-menu-handle', (props) => {
            console.info('custom use registry and transform', props);
            return { value: 'custom' };
          })
          .addTupleDynamic('highlight', (props) => {
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

export { loadHighlightDemoDatasets } from './highlight-datasets';

export async function loadIdentifyDemoDatasets(mapId: string) {
  await addDatasetToMap(mapId, createSimpleIdentifyDataset());
  await addDatasetToMap(mapId, createIdentifyWithMenuDataset());
}

export async function loadListDemoDatasets(mapId: string) {
  await addDatasetToMap(mapId, createDefaultListDataset());
  await addDatasetToMap(mapId, createCustomColorListDataset());
  await addDatasetToMap(mapId, createListWithLegendDataset());
  await addDatasetToMap(mapId, createListWithMenuDataset());
  await addDatasetToMap(mapId, createListWithCustomMenuComponentDataset());
  await addDatasetToMap(mapId, createListWithConditionMenusDataset());
}

export async function loadMenuDemoDatasets(mapId: string) {
  ensureCustomMenuHandler();
  await addDatasetToMap(mapId, createDefaultMenuSupportDataset());
  await addDatasetToMap(mapId, createCustomSupportDataset());
  await addDatasetToMap(mapId, createCustomMultiSupportDataset());
  await addDatasetToMap(mapId, createCustomChainSupportDataset());
}
