import { getChartRandomColor } from '@hungpvq/map-core';
import {
  createDatasetPartGeojsonSourceComponent,
  createDatasetPartGroupSubListViewUiComponentBuilder,
  createDatasetPartListViewUiComponentBuilder,
  createDatasetPartMetadataComponent,
  createDatasetPartRasterSourceComponent,
  createDatasetPartSubListViewUiComponentBuilder,
  createGroupDataset,
  createMenuBuilder,
  createMenuItemShowDetailInfoSource,
  createMenuItemToBoundActionForList,
  createMenuItemToggleShow,
  createMultiMapboxLayerComponent,
  createRootDataset,
  LayerSimpleMapboxBuild,
} from '@hungpvq/map-dataset';
import { mdiPen, mdiStar } from '@mdi/js';
import {
  DEMO_LIST_BBOX,
  demoLine,
  demoPoint,
  demoPolygon,
} from '../../fixtures/geojson';
import { createRasterSourceConfig } from '../../fixtures/raster';
import { createMultiLegend } from '../../legend/create-legend';
import { DEMO_SAMPLE_LAYER_MENU_KEY } from '../../registry/menu-handlers';

/** List-only: bare row in LayerControl. */
export function createListOnlyDefaultDataset() {
  const dataset = createRootDataset('Default');
  const list1 =
    createDatasetPartListViewUiComponentBuilder('Default list').build();
  dataset.add(list1);
  return dataset;
}

/** @deprecated Use createListOnlyDefaultDataset */
export const createDefaultListDataset = createListOnlyDefaultDataset;

export function createCustomColorListDataset() {
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

export function createListWithLegendDataset() {
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

export function createListWithMenuDataset() {
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

export function createListWithCustomMenuComponentDataset() {
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
        .setComponentMenuKey(DEMO_SAMPLE_LAYER_MENU_KEY)
        .build(),
    ])
    .build();
  dataset.add(list1);
  return dataset;
}

export function createListWithConditionMenusDataset() {
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

/** Two lists sharing the same list.group for LayerControl grouping. */
export function createListWithGroupDataset() {
  const dataset = createRootDataset('List group demo');
  const group = { id: 'list-group-demo', name: 'Grouped layers' };
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      demoPolygon(
        [
          [
            [105.8, 20.9],
            [105.8, 21.2],
            [106.2, 21.2],
            [106.2, 20.9],
            [105.8, 20.9],
          ],
        ],
        { id: '1', name: 'area feature' },
      ),
      demoPoint([106.0, 21.05], { id: '2', name: 'point feature' }),
    ],
  });
  const groupLayer1 = createGroupDataset('Group layer 1');
  const list1 = createDatasetPartListViewUiComponentBuilder('Grouped area')
    .setColor('#0000FF')
    .setGroup(group)
    .build();
  const layer1 = createMultiMapboxLayerComponent('layer area', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list1.color)
      .setOpacity(0.5)
      .build(),
  ]);
  groupLayer1.add(layer1);
  groupLayer1.add(list1);

  const groupLayer2 = createGroupDataset('Group layer 2');
  const list2 = createDatasetPartListViewUiComponentBuilder('Grouped point')
    .setColor('#ff0000')
    .setGroup(group)
    .build();
  const layer2 = createMultiMapboxLayerComponent('layer point', [
    new LayerSimpleMapboxBuild()
      .setStyleType('point')
      .setColor(list2.color)
      .build(),
  ]);
  groupLayer2.add(layer2);
  groupLayer2.add(list2);

  list1.addMenus([
    createMenuItemToggleShow(),
    createMenuItemShowDetailInfoSource(),
  ]);
  list2.addMenus([createMenuItemToggleShow()]);

  dataset.add(source);
  dataset.add(groupLayer1);
  dataset.add(groupLayer2);
  return dataset;
}

function createVectorListDataset(
  name: string,
  styleType: 'point' | 'line',
  feature: ReturnType<typeof demoPoint> | ReturnType<typeof demoLine>,
) {
  const dataset = createRootDataset(name);
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [feature],
  });
  const groupLayer = createGroupDataset('Group layer');
  const list = createDatasetPartListViewUiComponentBuilder(name)
    .setColor(getChartRandomColor())
    .build();
  const layer = createMultiMapboxLayerComponent(`layer ${styleType}`, [
    new LayerSimpleMapboxBuild()
      .setStyleType(styleType)
      .setColor(list.color)
      .build(),
  ]);
  groupLayer.add(layer);
  groupLayer.add(list);
  list.addMenus([
    createMenuItemToggleShow(),
    createMenuItemShowDetailInfoSource(),
  ]);
  dataset.add(source);
  dataset.add(groupLayer);
  return dataset;
}

export function createVectorPointListDataset() {
  return createVectorListDataset(
    'Vector point list',
    'point',
    demoPoint([105.9, 21.0], { id: 'p1', name: 'demo point' }),
  );
}

export function createVectorLineListDataset() {
  return createVectorListDataset(
    'Vector line list',
    'line',
    demoLine(
      [
        [105.7, 20.8],
        [106.1, 21.1],
        [106.3, 20.9],
      ],
      { id: 'l1', name: 'demo line' },
    ),
  );
}

export function createRasterListDataset() {
  const name = 'Raster list (World Imagery)';
  const bbox = DEMO_LIST_BBOX;
  const dataset = createRootDataset(name);
  const source = createDatasetPartRasterSourceComponent(
    name,
    createRasterSourceConfig(bbox),
  );
  const layer = createMultiMapboxLayerComponent(name, [{ type: 'raster' }]);
  const list = createDatasetPartListViewUiComponentBuilder(name)
    .setColor('#4CAF50')
    .build();
  const group = createGroupDataset(name);
  dataset.add(createDatasetPartMetadataComponent(name, { bbox }));
  dataset.add(source);
  group.add(list);
  group.add(layer);
  dataset.add(group);
  list.addMenus([
    createMenuItemToggleShow(),
    createMenuItemShowDetailInfoSource(),
    createMenuItemToBoundActionForList({ bbox }),
  ]);
  return dataset;
}

function buildSublistDataset(options: { withSublistMenus: boolean }) {
  const dataset = createRootDataset('Sublist demo');
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      demoPolygon(
        [
          [
            [105.7, 20.85],
            [105.7, 21.15],
            [106.3, 21.15],
            [106.3, 20.85],
            [105.7, 20.85],
          ],
        ],
        {},
      ),
    ],
  });
  dataset.add(source);

  const groupLayer = createGroupDataset('Group layer');
  const list = createDatasetPartGroupSubListViewUiComponentBuilder(
    options.withSublistMenus
      ? 'Group list with sublist menus'
      : 'Group list with sublists',
  )
    .setColor(getChartRandomColor())
    .configInitShowChildren()
    .addMenus([createMenuItemToggleShow({ location: 'bottom' })])
    .build();
  groupLayer.add(list);
  dataset.add(groupLayer);

  const subList1 = createDatasetPartSubListViewUiComponentBuilder('Sub list point')
    .setColor(getChartRandomColor())
    .addMenus(
      options.withSublistMenus ? [createMenuItemToggleShow()] : [],
    )
    .build();
  const groupSubLayer1 = createGroupDataset('Group sub layer 1');
  groupSubLayer1.add(subList1);
  groupSubLayer1.add(
    createMultiMapboxLayerComponent('sub layer point', [
      new LayerSimpleMapboxBuild()
        .setStyleType('point')
        .setColor(subList1.color)
        .build(),
    ]),
  );

  const subList2 = createDatasetPartSubListViewUiComponentBuilder('Sub list line')
    .setColor(getChartRandomColor())
    .addMenus(
      options.withSublistMenus ? [createMenuItemToggleShow()] : [],
    )
    .build();
  const groupSubLayer2 = createGroupDataset('Group sub layer 2');
  groupSubLayer2.add(subList2);
  groupSubLayer2.add(
    createMultiMapboxLayerComponent('sub layer line', [
      new LayerSimpleMapboxBuild()
        .setStyleType('line')
        .setColor(subList2.color)
        .build(),
    ]),
  );

  list.add(groupSubLayer1);
  list.add(groupSubLayer2);
  return dataset;
}

export function createListWithSublistDataset() {
  return buildSublistDataset({ withSublistMenus: false });
}

export function createListWithSublistMenuDataset() {
  return buildSublistDataset({ withSublistMenus: true });
}

export const LIST_DEMO_DATASET_FACTORIES = [
  createListOnlyDefaultDataset,
  createCustomColorListDataset,
  createListWithLegendDataset,
  createListWithMenuDataset,
  createListWithCustomMenuComponentDataset,
  createListWithConditionMenusDataset,
  createListWithGroupDataset,
  createVectorPointListDataset,
  createVectorLineListDataset,
  createRasterListDataset,
  createListWithSublistDataset,
  createListWithSublistMenuDataset,
] as const;
