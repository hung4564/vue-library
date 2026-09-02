import {
  createDatasetPartDataManagementGeojsonLocalComponent,
  createDatasetPartDataManagementListLocalComponent,
  createDatasetPartGeojsonSourceComponent,
  createDatasetPartIdentifyComponentBuilder,
  createDatasetPartListViewUiComponentBuilder,
  createMultiMapboxLayerComponent,
  createRootDataset,
  LayerSimpleMapboxBuild,
} from '@hungpvq/map-dataset';

export function createDataManagementGeojsonListDataset() {
  const dataset = createRootDataset('Default');
  const list = createDatasetPartListViewUiComponentBuilder('Default list').build();
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [],
  });
  const layer = createMultiMapboxLayerComponent('layer area', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list.color)
      .setOpacity(0.5)
      .build(),
  ]);
  const dataManagement = createDatasetPartDataManagementGeojsonLocalComponent(
    'data management',
    {
      initData: [
        {
          id: '1',
          type: 'Feature',
          properties: {
            id: '1',
            name: 'feature 1',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [105.76641783359327, 20.95368549262608],
                [105.76641783359327, 20.8061675909956],
                [105.95982873776939, 20.8061675909956],
                [105.95982873776939, 20.95368549262608],
                [105.76641783359327, 20.95368549262608],
              ],
            ],
          },
        },
        {
          id: '2',
          type: 'Feature',
          properties: {
            id: '2',
            name: 'feature 2',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [105.6018867927948, 20.882848913115083],
                [105.6018867927948, 20.709350165412573],
                [105.85443227815665, 20.709350165412573],
                [105.85443227815665, 20.882848913115083],
                [105.6018867927948, 20.882848913115083],
              ],
            ],
          },
        },
      ],
    },
  );
  const identify = createDatasetPartIdentifyComponentBuilder(list.getName())
    .setConfigFields([
      { text: 'Id', value: 'id' },
      { text: 'Name', value: 'name' },
    ])
    .configFieldName('id')
    .build();
  dataset.add(identify);
  dataset.add(list);
  dataset.add(source);
  dataset.add(layer);
  dataset.add(dataManagement);
  return dataset;
}

export function createDataManagementListItemDataset() {
  const dataset = createRootDataset('Default');
  const list = createDatasetPartListViewUiComponentBuilder('Default list item').build();
  const source = createDatasetPartGeojsonSourceComponent(list.getName(), {
    type: 'FeatureCollection',
    features: [],
  });
  const layer = createMultiMapboxLayerComponent(list.getName(), [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list.color)
      .setOpacity(0.5)
      .build(),
  ]);
  const dataManagement = createDatasetPartDataManagementListLocalComponent(
    list.getName(),
    {
      key: 'geojson-list',
      initData: [
        {
          id: 1,
          name: 'name 1',
          geometry: {
            coordinates: [
              [
                [106.36703216122214, 21.339114575625146],
                [106.36703216122214, 21.258074000185104],
                [106.49668551611245, 21.258074000185104],
                [106.49668551611245, 21.339114575625146],
                [106.36703216122214, 21.339114575625146],
              ],
            ],
            type: 'Polygon',
          },
        },
      ],
    },
  );
  const identify = createDatasetPartIdentifyComponentBuilder(list.getName())
    .setConfigFields([
      { text: 'Id', value: 'id' },
      { text: 'Name', value: 'name' },
    ])
    .configFieldName('id')
    .build();
  dataset.add(identify);
  dataset.add(list);
  dataset.add(source);
  dataset.add(layer);
  dataset.add(dataManagement);
  return dataset;
}

export function createDataManagementDrawListItemDataset() {
  const dataset = createRootDataset('Default');
  const list = createDatasetPartListViewUiComponentBuilder('Draw list item').build();
  const source = createDatasetPartGeojsonSourceComponent(list.getName(), {
    type: 'FeatureCollection',
    features: [],
  });
  const layer = createMultiMapboxLayerComponent(list.getName(), [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list.color)
      .setOpacity(0.5)
      .build(),
  ]);
  const dataManagement = createDatasetPartDataManagementListLocalComponent<{
    id: string;
    name: string;
  }>(list.getName(), {
    key: 'geojson-list-draw',
    initData: [],
    hooks: [
      {
        beforeCreate(ctx) {
          console.info('beforeCreate', ctx);
        },
        beforeUpdate(ctx) {
          console.info('beforeUpdate', ctx);
        },
        beforeDelete(ctx) {
          console.info('beforeDelete', ctx);
        },
        afterCreate(ctx) {
          console.info('afterCreate', ctx);
        },
        afterUpdate(ctx) {
          console.info('afterUpdate', ctx);
        },
        afterDelete(ctx) {
          console.info('afterDelete', ctx);
        },
      },
    ],
  });
  const identify = createDatasetPartIdentifyComponentBuilder(list.getName())
    .setConfigFields([
      { text: 'Id', value: 'id' },
      { text: 'Name', value: 'name' },
    ])
    .configFieldName('id')
    .build();
  dataset.add(identify);
  dataset.add(list);
  dataset.add(source);
  dataset.add(layer);
  dataset.add(dataManagement);
  return dataset;
}

export const DATA_MANAGEMENT_DEMO_DATASET_FACTORIES = [
  createDataManagementGeojsonListDataset,
  createDataManagementListItemDataset,
  createDataManagementDrawListItemDataset,
] as const;
