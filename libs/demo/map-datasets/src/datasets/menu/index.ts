import { getChartRandomColor } from '@hungpvq/map-core';
import {
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
  LayerSimpleMapboxBuild,
  type MenuItemClick,
} from '@hungpvq/map-dataset';
import {
  mdiAppleKeyboardCommand,
  mdiCrosshairsGps,
  mdiMarker,
  mdiPen,
  mdiRegisteredTrademark,
} from '@mdi/js';
import { DEMO_BBOX, DEMO_POLYGON } from '../../fixtures/geojson';
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
  createCustomSupportDataset,
  createCustomMultiSupportDataset,
  createCustomChainSupportDataset,
] as const;
