import { getChartRandomColor } from '@hungpvq/map-core';
import {
  createDatasetPartBoundComponent,
  createDatasetPartGeojsonSourceComponent,
  createDatasetPartIdentifyComponentBuilder,
  createDatasetPartListViewUiComponentBuilder,
  createGroupDataset,
  createMenuBuilder,
  createMenuClickBuilder,
  createMenuClickHighlightBuilder,
  createMenuItemIdentifyForList,
  createMenuItemShowDetailInfoSource,
  createMenuItemStyleEdit,
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
} from '../../fixtures/geojson';
import { DEMO_CUSTOM_MENU_HANDLER_KEY } from '../../registry/menu-handlers';

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

export const MENU_DEMO_DATASET_FACTORIES = [
  createDefaultMenuSupportDataset,
  createDynamicBoundMenuDataset,
  createIdentifyMenuDataset,
  createCustomSupportDataset,
  createCustomMultiSupportDataset,
  createCustomChainSupportDataset,
] as const;
