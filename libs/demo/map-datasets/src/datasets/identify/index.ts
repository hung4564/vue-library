import { getChartRandomColor } from '@hungpvq/map-core';
import { createDatasetPartGeojsonSourceComponent } from '@hungpvq/map-dataset/geojson';
import { createDatasetPartHighlightComponent, createDatasetPartListViewUiComponentBuilder, createGroupDataset, createMultiMapboxLayerComponent, createRootDataset } from '@hungpvq/map-dataset';
import { createDatasetPartIdentifyComponentBuilder } from '@hungpvq/map-dataset/identify';
import { createMenuItemIdentifyForList, createMenuItemShowDetailForItem, createMenuItemShowDetailInfoSource, createMenuItemStyleEdit, createMenuItemToBoundActionForItem, createMenuItemToggleShow } from '@hungpvq/map-dataset/menu';
import { LayerSimpleMapboxBuild } from '@hungpvq/map-dataset/style';
import { IDENTIFY_GROUP, NO_GROUP_IDENTIFY } from '../../fixtures/geojson';

export function createSimpleIdentifyDataset() {
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
  list.addMenus([createMenuItemToggleShow(), createMenuItemIdentifyForList()]);
  const identify =
    createDatasetPartIdentifyComponentBuilder('Simple identify').build();
  dataset.add(identify);
  dataset.add(source);
  dataset.add(groupLayer);
  return dataset;
}

export function createIdentifyWithMenuDataset() {
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

export function createOtherDatasetButSameGroup() {
  const dataset = createRootDataset('Other Dataset but same group');
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: '1',
          name: 'feature: Other Dataset but same group ',
        },
        geometry: {
          coordinates: [
            [
              [105.44444615897697, 20.899297758842522],
              [105.44444615897697, 20.67343872335738],
              [105.78642132314343, 20.67343872335738],
              [105.78642132314343, 20.899297758842522],
              [105.44444615897697, 20.899297758842522],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });
  const groupLayer = createGroupDataset('Group layer 1');
  const list = createDatasetPartListViewUiComponentBuilder(
    'Other Dataset but same group',
  )
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
  const identify = createDatasetPartIdentifyComponentBuilder(
    'Other Dataset but same group',
  )
    .setGroup(IDENTIFY_GROUP)
    .build();
  dataset.add(identify);
  dataset.add(source);
  dataset.add(groupLayer);
  return dataset;
}

export function createGroupIdentifyPageDataset() {
  const dataset = createRootDataset('Group Identify');
  const source1 = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: 2,
          name: 'feature 2 Group Identify',
        },
        geometry: {
          coordinates: [
            [
              [105.63135562387322, 20.797054008577902],
              [105.63135562387322, 20.500520627293113],
              [106.09655861537681, 20.500520627293113],
              [106.09655861537681, 20.797054008577902],
              [105.63135562387322, 20.797054008577902],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });

  const identify1 = createDatasetPartIdentifyComponentBuilder(
    'Group Identify 1',
  )
    .isUseMerge()
    .setGroup(IDENTIFY_GROUP)
    .setConfigFields([
      { text: 'Id', value: 'id' },
      { text: 'Name', value: 'name' },
    ])
    .build();
  const groupLayer1 = createGroupDataset('Group Identify 1');
  const list1 = createDatasetPartListViewUiComponentBuilder('Group Identify 1')
    .setColor('#0000FF')
    .setGroup(IDENTIFY_GROUP)
    .build();
  list1.color = '#0000FF';
  const layer1 = createMultiMapboxLayerComponent('layer area', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list1.color)
      .build(),
    new LayerSimpleMapboxBuild().setStyleType('line').setColor('#000').build(),
  ]);
  groupLayer1.add(source1);
  groupLayer1.add(layer1);
  groupLayer1.add(list1);
  groupLayer1.add(identify1);
  const groupLayer2 = createGroupDataset('Group Identify 2');
  const identify2 = createDatasetPartIdentifyComponentBuilder(
    'Group Identify 2',
  )
    .isUseMerge()
    .setGroup(IDENTIFY_GROUP)
    .setConfigFields([
      { text: 'Id', value: 'id' },
      { text: 'Name', value: 'name' },
    ])
    .build();
  const list2 = createDatasetPartListViewUiComponentBuilder('Group Identify 2')
    .setColor('#ff0000')
    .setGroup(IDENTIFY_GROUP)
    .build();
  const layer2 = createMultiMapboxLayerComponent('layer point', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list2.color)
      .build(),
    new LayerSimpleMapboxBuild().setStyleType('line').setColor('#000').build(),
  ]);
  const source2 = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: 3,
          name: 'feature 3 Group Identify',
        },
        geometry: {
          coordinates: [
            [
              [105.71455307455238, 20.840388211189335],
              [105.71455307455238, 20.72566421903626],
              [106.03406129600307, 20.72566421903626],
              [106.03406129600307, 20.840388211189335],
              [105.71455307455238, 20.840388211189335],
            ],
          ],
          type: 'Polygon',
        },
      },
      {
        type: 'Feature',
        properties: {
          id: 4,
          name: 'feature 4 Group Identify',
        },
        geometry: {
          coordinates: [
            [
              [105.74696486602863, 20.755977636405987],
              [105.74696486602863, 20.61085136021447],
              [105.89977425617587, 20.61085136021447],
              [105.89977425617587, 20.755977636405987],
              [105.74696486602863, 20.755977636405987],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });
  const highlight = createDatasetPartHighlightComponent();
  const highlight2 = createDatasetPartHighlightComponent();
  groupLayer2.add(source2);
  groupLayer2.add(layer2);
  groupLayer2.add(list2);
  groupLayer2.add(identify2);
  groupLayer1.add(highlight);
  groupLayer2.add(highlight2);
  dataset.add(groupLayer1);
  dataset.add(groupLayer2);
  return dataset;
}

export function createNoGroupIdentifyDataset() {
  const dataset = createRootDataset('No group identify');
  const source1 = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: 1,
          name: 'feature 1: identify no group',
        },
        geometry: {
          coordinates: [
            [
              [105.56255318926247, 21.50065365631515],
              [105.56255318926247, 21.403263985529975],
              [105.84908819639861, 21.403263985529975],
              [105.84908819639861, 21.50065365631515],
              [105.56255318926247, 21.50065365631515],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });

  const identify1 = createDatasetPartIdentifyComponentBuilder(
    'No Group Identify 1',
  ).build();
  const groupLayer1 = createGroupDataset('No group identify 1');
  const list1 = createDatasetPartListViewUiComponentBuilder(
    'No group identify 1',
  )
    .setColor('#0000FF')
    .setGroup(NO_GROUP_IDENTIFY)
    .build();
  list1.color = '#0000FF';
  const layer1 = createMultiMapboxLayerComponent('layer area', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list1.color)
      .build(),
    new LayerSimpleMapboxBuild().setStyleType('line').setColor('#000').build(),
  ]);
  groupLayer1.add(source1);
  groupLayer1.add(layer1);
  groupLayer1.add(list1);
  groupLayer1.add(identify1);
  const groupLayer2 = createGroupDataset('No group identify 2');
  const identify2 = createDatasetPartIdentifyComponentBuilder(
    'No group identify 2',
  ).build();
  const list2 = createDatasetPartListViewUiComponentBuilder(
    'No group identify 2',
  )
    .setColor('#ff0000')
    .setGroup(NO_GROUP_IDENTIFY)
    .build();
  const layer2 = createMultiMapboxLayerComponent('layer point', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list2.color)
      .build(),
    new LayerSimpleMapboxBuild().setStyleType('line').setColor('#000').build(),
  ]);
  const source2 = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: 2,
          name: 'feature 2: identify no group',
        },
        geometry: {
          coordinates: [
            [
              [105.80103412547533, 21.55472769478591],
              [105.80103412547533, 21.446510825568424],
              [106.16705691566278, 21.446510825568424],
              [106.16705691566278, 21.55472769478591],
              [105.80103412547533, 21.55472769478591],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });
  const highlight = createDatasetPartHighlightComponent();
  const highlight2 = createDatasetPartHighlightComponent();
  groupLayer2.add(source2);
  groupLayer2.add(layer2);
  groupLayer2.add(list2);
  groupLayer2.add(identify2);
  groupLayer1.add(highlight);
  groupLayer2.add(highlight2);
  dataset.add(groupLayer1);
  dataset.add(groupLayer2);
  return dataset;
}

const IDENTIFY_API_DELAY_MS = 1000;

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/** Fake detail API — Enrich map features after ~1s. */
async function fakeFetchIdentifyDetail(
  features: Array<{
    id?: string | number;
    properties?: Record<string, unknown> | null;
    geometry?: unknown;
  }>,
) {
  const startedAt = performance.now();
  console.info('[identify-demo] getList:start', {
    count: features.length,
    delayMs: IDENTIFY_API_DELAY_MS,
  });
  await delay(IDENTIFY_API_DELAY_MS);
  const rows = features.map((feature, index) => {
    const props = feature.properties || {};
    return {
      ...props,
      id: props.id ?? feature.id ?? index,
      name: props.name ?? `feature-${index}`,
      status: 'from-api',
      fetchedAt: new Date().toISOString(),
      geometry: feature.geometry,
    };
  });
  console.info('[identify-demo] getList:done', {
    count: rows.length,
    durationMs: Math.round(performance.now() - startedAt),
  });
  return rows;
}

/** Single layer: identify detail via async getList (fake API ~1s). */
export function createIdentifyApiDetailDataset() {
  const dataset = createRootDataset('Identify API detail');
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: 'api-1',
          name: 'feature: Identify API detail',
        },
        geometry: {
          coordinates: [
            [
              [106.2, 21.35],
              [106.2, 21.28],
              [106.32, 21.28],
              [106.32, 21.35],
              [106.2, 21.35],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });
  const groupLayer = createGroupDataset('Group layer API detail');
  const list = createDatasetPartListViewUiComponentBuilder(
    'Identify API detail',
  )
    .setColor('#2a9d8f')
    .build();
  const layer = createMultiMapboxLayerComponent('layer area', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list.color)
      .build(),
  ]);
  const highlight = createDatasetPartHighlightComponent();
  groupLayer.add(layer);
  groupLayer.add(highlight);
  groupLayer.add(list);
  list.addMenus([createMenuItemToggleShow(), createMenuItemIdentifyForList()]);

  const identify = createDatasetPartIdentifyComponentBuilder(
    'Identify API detail',
  )
    .preferResultControl()
    .setConfigFields([
      { text: 'Id', value: 'id' },
      { text: 'Name', value: 'name' },
      { text: 'Status', value: 'status' },
      { text: 'Fetched at', value: 'fetchedAt' },
    ])
    .addMenus([createMenuItemToBoundActionForItem()])
    .build();

  identify.getList = async (_mapId, features) =>
    fakeFetchIdentifyDetail(features);

  dataset.add(identify);
  dataset.add(source);
  dataset.add(groupLayer);
  return dataset;
}

/** Two layers: one merged identify query via async getMergedFeatures (fake API ~1s). */
export function createIdentifyApiMergedDataset() {
  const dataset = createRootDataset('Identify API merge');
  const mergeGroupId = 'identify-api-merge';

  const source1 = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: 'merge-a',
          name: 'feature A: Identify API merge',
        },
        geometry: {
          coordinates: [
            [
              [106.35, 20.95],
              [106.35, 20.85],
              [106.48, 20.85],
              [106.48, 20.95],
              [106.35, 20.95],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });
  const identify1 = createDatasetPartIdentifyComponentBuilder(
    'Identify API merge 1',
  )
    .isUseMerge(mergeGroupId)
    .setConfigFields([
      { text: 'Id', value: 'id' },
      { text: 'Name', value: 'name' },
      { text: 'Status', value: 'status' },
      { text: 'Fetched at', value: 'fetchedAt' },
    ])
    .build();
  const groupLayer1 = createGroupDataset('Identify API merge 1');
  const list1 = createDatasetPartListViewUiComponentBuilder(
    'Identify API merge 1',
  )
    .setColor('#264653')
    .build();
  const layer1 = createMultiMapboxLayerComponent('layer area', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list1.color)
      .build(),
    new LayerSimpleMapboxBuild().setStyleType('line').setColor('#000').build(),
  ]);
  groupLayer1.add(source1);
  groupLayer1.add(layer1);
  groupLayer1.add(list1);
  groupLayer1.add(identify1);
  groupLayer1.add(createDatasetPartHighlightComponent());

  const source2 = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: 'merge-b',
          name: 'feature B: Identify API merge',
        },
        geometry: {
          coordinates: [
            [
              [106.4, 20.92],
              [106.4, 20.8],
              [106.55, 20.8],
              [106.55, 20.92],
              [106.4, 20.92],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  });
  const identify2 = createDatasetPartIdentifyComponentBuilder(
    'Identify API merge 2',
  )
    .isUseMerge(mergeGroupId)
    .setConfigFields([
      { text: 'Id', value: 'id' },
      { text: 'Name', value: 'name' },
      { text: 'Status', value: 'status' },
      { text: 'Fetched at', value: 'fetchedAt' },
    ])
    .build();
  const groupLayer2 = createGroupDataset('Identify API merge 2');
  const list2 = createDatasetPartListViewUiComponentBuilder(
    'Identify API merge 2',
  )
    .setColor('#e76f51')
    .build();
  const layer2 = createMultiMapboxLayerComponent('layer area', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list2.color)
      .build(),
    new LayerSimpleMapboxBuild().setStyleType('line').setColor('#000').build(),
  ]);
  groupLayer2.add(source2);
  groupLayer2.add(layer2);
  groupLayer2.add(list2);
  groupLayer2.add(identify2);
  groupLayer2.add(createDatasetPartHighlightComponent());

  const originalGetMerged = identify1.getMergedFeatures.bind(identify1);
  const delayedGetMerged: typeof identify1.getMergedFeatures = async (
    identifies,
    payload,
  ) => {
    const startedAt = performance.now();
    console.info('[identify-demo] getMergedFeatures:start', {
      identifyCount: identifies.length,
      delayMs: IDENTIFY_API_DELAY_MS,
    });
    await delay(IDENTIFY_API_DELAY_MS);
    const results = await originalGetMerged(identifies, payload);
    const fetchedAt = new Date().toISOString();
    const enriched = results.map(
      (row: { feature: { data?: Record<string, unknown> } }) => ({
        ...row,
        feature: {
          ...row.feature,
          data: {
            ...(row.feature.data || {}),
            status: 'from-api-merge',
            fetchedAt,
          },
        },
      }),
    );
    console.info('[identify-demo] getMergedFeatures:done', {
      count: enriched.length,
      durationMs: Math.round(performance.now() - startedAt),
    });
    return enriched;
  };
  identify1.getMergedFeatures = delayedGetMerged;
  identify2.getMergedFeatures = delayedGetMerged;

  dataset.add(groupLayer1);
  dataset.add(groupLayer2);
  return dataset;
}

export const IDENTIFY_DEMO_DATASET_FACTORIES = [
  createSimpleIdentifyDataset,
  createIdentifyWithMenuDataset,
  createNoGroupIdentifyDataset,
  createOtherDatasetButSameGroup,
  createGroupIdentifyPageDataset,
  createIdentifyApiDetailDataset,
  createIdentifyApiMergedDataset,
] as const;
