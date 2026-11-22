import { getMap, logHelper, type MapSimple } from '@hungpvq/map-core';
import type { MapGeoJSONFeature, PointLike } from 'maplibre-gl';

import type { IDataset } from '../interfaces/dataset.base';
import type {
  IdentifyFeatureRow,
  IdentifyMultiResult,
  IIdentifyView,
  IIdentifyViewWithMerge,
  IMapboxLayerView,
} from '../interfaces/dataset.parts';
import { loggerIdentify } from '../logger';
import {
  createMenuItemShowDetailForItem,
  createWithMenuHelper,
  LIST_VIEW_MENU_ID,
} from '../menu/items';
import { createNamedComponent } from '../model/base';
import { createDatasetLeaf } from '../model/dataset.base.function';
import { runAllComponentsWithCheck } from '../model/visitors/helpers';
import { isIdentifyMergeView, isMapboxLayerView } from '../utils/check';
import {
  getMergedFeatures,
  mergePayload,
  splitResponse,
} from './identifyMapboxMerged';
import { buildIdentifyFeatureRows } from './rows';

/** Ensure `show-detail` menu exists when identify has detail fields. */
export function ensureIdentifyShowDetailMenu(identify: IIdentifyView): void {
  const fields = identify.config?.fields;
  if (!fields?.length || identify.hasMenu(LIST_VIEW_MENU_ID.item.showDetail)) {
    return;
  }
  identify.addMenu(createMenuItemShowDetailForItem(fields));
}

export function createDatasetPartIdentifyComponent(
  name: string,
  config: IIdentifyView['config'],
  options?: {
    getFeature?: IIdentifyView['getFeature'];
  },
): IIdentifyView {
  const base = createDatasetLeaf(name);
  const menu = createWithMenuHelper();

  const dataset = createNamedComponent('IdentifyComponent', {
    get config() {
      return config || {};
    },
    ...base,
    ...menu,
    get type(): string {
      return 'identify';
    },
    ...(options?.getFeature ? { getFeature: options.getFeature } : {}),
    getFeatures(
      _mapId: string,
      _pointOrBox?: PointLike | [PointLike, PointLike],
    ): Promise<IdentifyFeatureRow[]> {
      throw new Error('Method getFeatures not implemented.');
    },
  });
  ensureIdentifyShowDetailMenu(dataset);
  return dataset;
}
export function createIdentifyMapboxComponent(
  name: string,
  config: IIdentifyView['config'] = {},
  options?: {
    getFeature?: IIdentifyView['getFeature'];
  },
) {
  const datasetPartIdentify = createDatasetPartIdentifyComponent(
    name,
    config,
    options,
  );

  const self = createNamedComponent('IdentifyMapboxComponent', {
    ...datasetPartIdentify,
    getFeatures(
      mapId: string,
      pointOrBox?: PointLike | [PointLike, PointLike],
    ): Promise<IdentifyFeatureRow[]> {
      return new Promise<IdentifyFeatureRow[]>((resolve) => {
        const results = runAllComponentsWithCheck(
          self.getParent() || self,
          (dataset): dataset is IDataset & IMapboxLayerView =>
            isMapboxLayerView(dataset),
          [
            (dataset) => {
              return dataset.getAllLayerIds();
            },
          ],
        );

        const allLayerIds: string[] = Array.from(results.values()).flat(2);
        logHelper(loggerIdentify, mapId, 'dataset', self.id)
          .with({ fn: 'getFeatures', span: 'identify.query' })
          .debug('Identify mapbox getFeatures started.', {
            layerCount: allLayerIds.length,
            pointOrBox,
          });
        getMap(mapId, (map: MapSimple) => {
          const features: MapGeoJSONFeature[] = map.queryRenderedFeatures(
            pointOrBox,
            {
              layers: allLayerIds.filter((id) => map.getLayer(id)),
            },
          );
          logHelper(loggerIdentify, mapId, 'dataset', self.id)
            .with({ fn: 'getFeatures', span: 'identify.query' })
            .debug(
              'Map queryRenderedFeatures returned candidates for identify.',
              { featureCount: features.length },
            );
          if (!features.length) {
            resolve([]);
            return;
          }

          void buildIdentifyFeatureRows(self, features).then((rows) => {
            logHelper(loggerIdentify, mapId, 'dataset', self.id)
              .with({ fn: 'getFeatures', span: 'identify.query' })
              .debug('Identify mapbox getFeatures finished.', {
                rowCount: rows.length,
              });
            resolve(rows);
          });
        });
      });
    },
  });

  return self;
}
export function createIdentifyMapboxMergedComponent(
  name: string,
  config?: IIdentifyView['config'],
  identifyGroupId = 'mapbox-group',
  options?: {
    getFeature?: IIdentifyView['getFeature'];
  },
): IIdentifyViewWithMerge {
  const base = createDatasetPartIdentifyComponent(name, config || {}, options);

  return createNamedComponent('IdentifyMapboxMergedComponent', {
    ...base,
    identifyGroupId,
    mergePayload,
    getMergedFeatures,
    splitResponse,
  });
}

function handleSingleIdentify(
  identify: IIdentifyView,
  mapId: string,
  pointOrBox?: PointLike | [PointLike, PointLike],
): Promise<IdentifyMultiResult> {
  return identify.getFeatures(mapId, pointOrBox).then((features) => ({
    identify,
    features,
  }));
}

function handleMergedIdentifyGroup(
  mergeIdentifies: IIdentifyViewWithMerge[],
  mapId: string,
  pointOrBox?: PointLike | [PointLike, PointLike],
): Promise<IdentifyMultiResult[]> {
  const mergedIdentify = mergeIdentifies[0];

  if (mergeIdentifies.length === 1) {
    return handleSingleIdentify(mergedIdentify, mapId, pointOrBox).then(
      (res) => [res],
    );
  }

  const payload = mergedIdentify.mergePayload(
    mergeIdentifies,
    mapId,
    pointOrBox,
  );

  return Promise.resolve(
    mergedIdentify.getMergedFeatures(mergeIdentifies, payload),
  ).then((response: unknown) => {
    return mergedIdentify.splitResponse(mergeIdentifies, payload, response);
  });
}

export async function handleMultiIdentify(
  identifies: IIdentifyView[],
  mapId: string,
  pointOrBox?: PointLike | [PointLike, PointLike],
  props = { selectThreshold: 5 },
  signal?: AbortSignal,
): Promise<IdentifyMultiResult[]> {
  if (signal?.aborted) {
    const err = new Error('Identify aborted');
    err.name = 'AbortError';
    throw err;
  }
  logHelper(loggerIdentify, mapId, 'MULTI', 'handleMultiIdentify')
    .with({ fn: 'handleMultiIdentify', span: 'identify.query' })
    .debug('start', { identifies, config: props, pointOrBox });
  const promises: Promise<IdentifyMultiResult | IdentifyMultiResult[]>[] = [];
  const groupMerge: Record<string, IIdentifyViewWithMerge[]> = {};
  if (pointOrBox && isPointLike(pointOrBox)) {
    const point = getXY(pointOrBox);
    pointOrBox = [
      [point.x - props.selectThreshold, point.y + props.selectThreshold], // bottom left (SW)
      [point.x + props.selectThreshold, point.y - props.selectThreshold], // top right (NE)
    ];
    logHelper(loggerIdentify, mapId, 'MULTI', 'handleMultiIdentify')
      .with({ fn: 'handleMultiIdentify', span: 'identify.query' })
      .debug('convert', {
        point,
        x: point.x,
        y: point.y,
        config: props,
        pointOrBox,
      });
  }
  identifies.forEach((identify) => {
    if (!isIdentifyMergeView(identify)) {
      promises.push(handleSingleIdentify(identify, mapId, pointOrBox));
      return;
    }

    const groupId = identify.identifyGroupId;
    if (!groupMerge[groupId]) groupMerge[groupId] = [];
    groupMerge[groupId].push(identify);
  });

  for (const groupId in groupMerge) {
    const mergeIdentifies = groupMerge[groupId];
    promises.push(
      handleMergedIdentifyGroup(mergeIdentifies, mapId, pointOrBox),
    );
  }

  logHelper(loggerIdentify, mapId, 'MULTI', 'handleMultiIdentify')
    .with({ fn: 'handleMultiIdentify', span: 'identify.query' })
    .debug('handle', { groupMerge });
  const result = await Promise.all(promises).then((res) => res.flat());
  if (signal?.aborted) {
    const err = new Error('Identify aborted');
    err.name = 'AbortError';
    throw err;
  }
  logHelper(loggerIdentify, mapId, 'MULTI', 'handleMultiIdentify')
    .with({ fn: 'handleMultiIdentify', span: 'identify.query' })
    .debug('end', { result });
  return result;
}

export async function handleMultiIdentifyGetFirst(
  identifies: IIdentifyView[],
  mapId: string,
  pointOrBox?: PointLike | [PointLike, PointLike],
  props = { selectThreshold: 5 },
  signal?: AbortSignal,
): Promise<IdentifyMultiResult | undefined> {
  if (signal?.aborted) {
    const err = new Error('Identify aborted');
    err.name = 'AbortError';
    throw err;
  }
  const allLayerIds: string[] = [];
  const cache: Record<string, IIdentifyView> = {};
  identifies.forEach((identify) => {
    const results = runAllComponentsWithCheck(
      identify.getParent() || identify,
      (dataset): dataset is IDataset & IMapboxLayerView =>
        isMapboxLayerView(dataset),
      [
        (dataset) => {
          return dataset.getAllLayerIds();
        },
      ],
    );
    const layerIds = Array.from(results.values()).flat(2);
    layerIds.forEach((layerId) => {
      cache[layerId] = identify;
    });
    allLayerIds.push(...layerIds);
  });
  logHelper(loggerIdentify, mapId, 'FIRST', 'handleMultiIdentifyGetFirst')
    .with({ fn: 'handleMultiIdentifyGetFirst', span: 'identify.show-first' })
    .debug('Show-first identify query started.', {
      identifyViewCount: identifies.length,
      layerCount: allLayerIds.length,
      selectThreshold: props.selectThreshold,
    });

  const features = await new Promise<MapGeoJSONFeature[]>((resolve, reject) => {
    if (signal?.aborted) {
      const err = new Error('Identify aborted');
      err.name = 'AbortError';
      reject(err);
      return;
    }
    getMap(mapId, (map: MapSimple) => {
      if (signal?.aborted) {
        const err = new Error('Identify aborted');
        err.name = 'AbortError';
        reject(err);
        return;
      }
      let queryBox = pointOrBox;
      if (queryBox && isPointLike(queryBox)) {
        const point = getXY(queryBox);
        queryBox = [
          [point.x - props.selectThreshold, point.y + props.selectThreshold],
          [point.x + props.selectThreshold, point.y - props.selectThreshold],
        ];
        logHelper(loggerIdentify, mapId, 'FIRST', 'handleMultiIdentifyGetFirst')
          .with({
            fn: 'handleMultiIdentifyGetFirst',
            span: 'identify.show-first',
          })
          .debug('Expanded point click into select-threshold query box.', {
            selectThreshold: props.selectThreshold,
          });
      }
      const queried = map.queryRenderedFeatures(queryBox, {
        layers: allLayerIds.filter((id) => map.getLayer(id)),
      });
      logHelper(loggerIdentify, mapId, 'FIRST', 'handleMultiIdentifyGetFirst')
        .with({
          fn: 'handleMultiIdentifyGetFirst',
          span: 'identify.show-first',
        })
        .debug('Show-first queryRenderedFeatures returned candidates.', {
          activeLayerCount: allLayerIds.filter((id) => map.getLayer(id)).length,
          featureCount: queried.length,
        });
      resolve(queried);
    });
  });

  if (signal?.aborted) {
    const err = new Error('Identify aborted');
    err.name = 'AbortError';
    throw err;
  }

  if (features.length < 1) {
    logHelper(loggerIdentify, mapId, 'FIRST', 'handleMultiIdentifyGetFirst')
      .with({ fn: 'handleMultiIdentifyGetFirst', span: 'identify.show-first' })
      .debug(
        'Show-first identify finished with no features under the pointer.',
      );
    return undefined;
  }

  const x = features[0];
  const datasetPartIdentify = cache[x.layer.id];
  if (!datasetPartIdentify) {
    return undefined;
  }

  const rows = await buildIdentifyFeatureRows(datasetPartIdentify, [x]);
  const row = rows[0];
  if (!row) {
    logHelper(loggerIdentify, mapId, 'FIRST', 'handleMultiIdentifyGetFirst')
      .with({ fn: 'handleMultiIdentifyGetFirst', span: 'identify.show-first' })
      .debug(
        'Show-first identify finished with no features under the pointer.',
      );
    return undefined;
  }

  if (signal?.aborted) {
    const err = new Error('Identify aborted');
    err.name = 'AbortError';
    throw err;
  }

  const result: IdentifyMultiResult = {
    identify: datasetPartIdentify,
    features: [row],
  };
  logHelper(loggerIdentify, mapId, 'FIRST', 'handleMultiIdentifyGetFirst')
    .with({ fn: 'handleMultiIdentifyGetFirst', span: 'identify.show-first' })
    .debug('Show-first identify finished with a feature hit.', {
      datasetId: datasetPartIdentify?.id,
      featureId: row.id,
    });
  return result;
}

function isPointLike(value: unknown): value is PointLike {
  if (Array.isArray(value)) {
    return (
      value.length === 2 &&
      typeof value[0] === 'number' &&
      typeof value[1] === 'number'
    );
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'x' in value &&
    'y' in value
  ) {
    const v = value as { x: unknown; y: unknown };
    return typeof v.x === 'number' && typeof v.y === 'number';
  }

  return false;
}
function isObjectWithXY(p: any): p is { x: number; y: number } {
  return p && typeof p.x === 'number' && typeof p.y === 'number';
}

function getXY(point: PointLike): { x: number; y: number } {
  // Duck-type Point / {x,y} — avoid runtime `import { Point } from 'maplibre-gl'`
  // (published maplibre UMD has no ESM named exports under Vite).
  if (isObjectWithXY(point)) {
    return { x: point.x, y: point.y };
  }
  return { x: point[0], y: point[1] };
}
