import {
  createMenuItemIdentifyForList,
  createMenuItemShowDetailForItem,
  createMenuItemShowDetailInfoSource,
  createMenuItemStyleEdit,
  createMenuItemToBoundActionForItem,
  createMenuItemToggleShow,
} from '@hungpvq/map-dataset/menu';
import type { IIdentifyView } from '@hungpvq/map-dataset/identify';
import { loggerFactory } from '@hungpvq/shared-log';
import { IDENTIFY_GROUP, NO_GROUP_IDENTIFY } from '../../fixtures/geojson';
import {
  createIdentifyDemoDataset,
  createIdentifyDemoMultiDataset,
} from './factory';

const logger = loggerFactory.createLogger().setNamespace('demo:identify', 2);

const DEMO_ID_NAME_FIELDS = [
  { text: 'Id', value: 'id' },
  { text: 'Name', value: 'name' },
];

const DEMO_API_FIELDS = [
  ...DEMO_ID_NAME_FIELDS,
  { text: 'Status', value: 'status' },
  { text: 'Fetched at', value: 'fetchedAt' },
];

export function createSimpleIdentifyDataset() {
  return createIdentifyDemoDataset({
    name: 'Simple identify',
    features: [
      {
        id: '1',
        name: 'feature: Simple identify ',
        bounds: [
          105.88682244523346, 21.116921872038418, 106.05662330762226,
          21.184791364696125,
        ],
      },
    ],
    listMenus: [createMenuItemToggleShow(), createMenuItemIdentifyForList()],
  });
}

export function createIdentifyWithMenuDataset() {
  return createIdentifyDemoDataset({
    name: 'Identify with menu',
    features: [
      {
        id: '1',
        name: 'feature: Identify with menu',
        bounds: [
          105.33907782961194, 20.896827873223472, 105.75969186796266,
          21.179166900967587,
        ],
      },
    ],
    listMenus: [
      createMenuItemToggleShow(),
      createMenuItemShowDetailInfoSource(),
      createMenuItemStyleEdit(),
    ],
    configureIdentify: (b) =>
      b
        .onSingle('detail')
        .onMultiple('result')
        .addMenus([
          createMenuItemToBoundActionForItem(),
          createMenuItemShowDetailForItem(DEMO_ID_NAME_FIELDS),
        ]),
  });
}

export function createOtherDatasetButSameGroup() {
  return createIdentifyDemoDataset({
    name: 'Other Dataset but same group',
    features: [
      {
        id: '1',
        name: 'feature: Other Dataset but same group ',
        bounds: [
          105.44444615897697, 20.67343872335738, 105.78642132314343,
          20.899297758842522,
        ],
      },
    ],
    configureIdentify: (b) => b.setGroup(IDENTIFY_GROUP),
  });
}

export function createGroupIdentifyPageDataset() {
  return createIdentifyDemoMultiDataset({
    rootName: 'Group Identify',
    layers: [
      {
        name: 'Group Identify 1',
        listColor: '#0000FF',
        listGroup: IDENTIFY_GROUP,
        withOutline: true,
        listMenus: [],
        features: [
          {
            id: 2,
            name: 'feature 2 Group Identify',
            bounds: [
              105.63135562387322, 20.500520627293113, 106.09655861537681,
              20.797054008577902,
            ],
          },
        ],
        configureIdentify: (b) =>
          b
            .isUseMerge()
            .setGroup(IDENTIFY_GROUP)
            .setConfigFields(DEMO_ID_NAME_FIELDS),
      },
      {
        name: 'Group Identify 2',
        listColor: '#ff0000',
        listGroup: IDENTIFY_GROUP,
        withOutline: true,
        listMenus: [],
        features: [
          {
            id: 3,
            name: 'feature 3 Group Identify',
            bounds: [
              105.71455307455238, 20.72566421903626, 106.03406129600307,
              20.840388211189335,
            ],
          },
          {
            id: 4,
            name: 'feature 4 Group Identify',
            bounds: [
              105.74696486602863, 20.61085136021447, 105.89977425617587,
              20.755977636405987,
            ],
          },
        ],
        configureIdentify: (b) =>
          b
            .isUseMerge()
            .setGroup(IDENTIFY_GROUP)
            .setConfigFields(DEMO_ID_NAME_FIELDS),
      },
    ],
  });
}

export function createNoGroupIdentifyDataset() {
  return createIdentifyDemoMultiDataset({
    rootName: 'No group identify',
    layers: [
      {
        name: 'No Group Identify 1',
        listName: 'No group identify 1',
        groupName: 'No group identify 1',
        listColor: '#0000FF',
        listGroup: NO_GROUP_IDENTIFY,
        withOutline: true,
        listMenus: [],
        features: [
          {
            id: 1,
            name: 'feature 1: identify no group',
            bounds: [
              105.56255318926247, 21.403263985529975, 105.84908819639861,
              21.50065365631515,
            ],
          },
        ],
      },
      {
        name: 'No Group Identify 2',
        listName: 'No group identify 2',
        groupName: 'No group identify 2',
        listColor: '#ff0000',
        listGroup: NO_GROUP_IDENTIFY,
        withOutline: true,
        listMenus: [],
        features: [
          {
            id: 2,
            name: 'feature 2: identify no group',
            bounds: [
              105.80103412547533, 21.446510825568424, 106.16705691566278,
              21.55472769478591,
            ],
          },
        ],
      },
    ],
  });
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
  logger.info('getList:start', {
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
  logger.info('getList:done', {
    count: rows.length,
    durationMs: Math.round(performance.now() - startedAt),
  });
  return rows;
}

type IdentifyWithMerge = IIdentifyView & {
  getMergedFeatures: (
    identifies: IIdentifyView[],
    payload: unknown,
  ) => Promise<unknown> | unknown;
};

function asMergeIdentify(view: IIdentifyView): IdentifyWithMerge | null {
  if (
    'getMergedFeatures' in view &&
    typeof (view as IdentifyWithMerge).getMergedFeatures === 'function'
  ) {
    return view as IdentifyWithMerge;
  }
  return null;
}

/** Single layer: identify detail via async getList (fake API ~1s). */
export function createIdentifyApiDetailDataset() {
  return createIdentifyDemoDataset({
    name: 'Identify API detail',
    groupName: 'Group layer API detail',
    listColor: '#2a9d8f',
    features: [
      {
        id: 'api-1',
        name: 'feature: Identify API detail',
        bounds: [106.2, 21.28, 106.32, 21.35],
      },
    ],
    listMenus: [createMenuItemToggleShow(), createMenuItemIdentifyForList()],
    configureIdentify: (b) =>
      b
        .onSingle('result')
        .onMultiple('result')
        .setConfigFields(DEMO_API_FIELDS)
        .addMenus([createMenuItemToBoundActionForItem()]),
    onIdentifyBuilt: (identify) => {
      identify.getList = async (_mapId, features) =>
        fakeFetchIdentifyDetail(features) as Promise<never[]>;
    },
  });
}

/** Two layers: one merged identify query via async getMergedFeatures (fake API ~1s). */
export function createIdentifyApiMergedDataset() {
  const mergeGroupId = 'identify-api-merge';
  const identifies: IIdentifyView[] = [];

  const dataset = createIdentifyDemoMultiDataset({
    rootName: 'Identify API merge',
    layers: [
      {
        name: 'Identify API merge 1',
        listColor: '#264653',
        withOutline: true,
        listMenus: [],
        features: [
          {
            id: 'merge-a',
            name: 'feature A: Identify API merge',
            bounds: [106.35, 20.85, 106.48, 20.95],
          },
        ],
        configureIdentify: (b) =>
          b.isUseMerge(mergeGroupId).setConfigFields(DEMO_API_FIELDS),
        onIdentifyBuilt: (identify) => {
          identifies.push(identify);
        },
      },
      {
        name: 'Identify API merge 2',
        listColor: '#e76f51',
        withOutline: true,
        listMenus: [],
        features: [
          {
            id: 'merge-b',
            name: 'feature B: Identify API merge',
            bounds: [106.4, 20.8, 106.55, 20.92],
          },
        ],
        configureIdentify: (b) =>
          b.isUseMerge(mergeGroupId).setConfigFields(DEMO_API_FIELDS),
        onIdentifyBuilt: (identify) => {
          identifies.push(identify);
        },
      },
    ],
  });

  const identify1 = asMergeIdentify(identifies[0]);
  const identify2 = asMergeIdentify(identifies[1]);
  if (identify1) {
    const originalGetMerged = identify1.getMergedFeatures.bind(identify1);
    const delayedGetMerged: IdentifyWithMerge['getMergedFeatures'] = async (
      idents,
      payload,
    ) => {
      const startedAt = performance.now();
      logger.info('getMergedFeatures:start', {
        identifyCount: idents.length,
        delayMs: IDENTIFY_API_DELAY_MS,
      });
      await delay(IDENTIFY_API_DELAY_MS);
      const results = (await originalGetMerged(idents, payload)) as Array<{
        feature: { data?: Record<string, unknown> };
      }>;
      const fetchedAt = new Date().toISOString();
      const enriched = results.map((row) => ({
        ...row,
        feature: {
          ...row.feature,
          data: {
            ...(row.feature.data || {}),
            status: 'from-api-merge',
            fetchedAt,
          },
        },
      }));
      logger.info('getMergedFeatures:done', {
        count: enriched.length,
        durationMs: Math.round(performance.now() - startedAt),
      });
      return enriched;
    };
    identify1.getMergedFeatures = delayedGetMerged;
    if (identify2) identify2.getMergedFeatures = delayedGetMerged;
  }

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

export { IDENTIFY_DEMO_HELP } from './help';
