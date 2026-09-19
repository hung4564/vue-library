import { getMap, logHelper, type MapSimple } from '@hungpvq/map-core';
import type { MapGeoJSONFeature, PointLike } from 'maplibre-gl';
import type { IDataset } from '../interfaces/dataset.base';
import type { IdentifyFeatureRow, IdentifyMultiResult, IIdentifyView, IIdentifyViewWithMerge, IMapboxLayerView } from '../interfaces/dataset.parts';
import { convertFeatureToItem } from '../utils/convert';
import { createDatasetLeaf } from '../model/dataset.base.function';
import { createNamedComponent } from '../model/base';
import {
  createMenuItemShowDetailForItem,
  createWithMenuHelper,
  LIST_VIEW_MENU_ID,
} from '../menu/items';
import { isIdentifyMergeView, isMapboxLayerView } from '../utils/check';
import { runAllComponentsWithCheck } from '../model/visitors/helpers';
import { loggerIdentify } from '../logger';
import {
  getMergedFeatures,
  mergePayload,
  splitResponse,
} from './identifyMapboxMerged';

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
    getFeatures(
      _mapId: string,
      _pointOrBox?: PointLike | [PointLike, PointLike],
    ): Promise<IdentifyFeatureRow[]> {
      throw new Error('Method getFeatures not implemented.');
    },
    async getList<Data>(mapId: string, features: MapGeoJSONFeature[]) {
      return features.map(convertFeatureToItem<Data>);
    },
  });
  ensureIdentifyShowDetailMenu(dataset);
  return dataset;
}
export function createIdentifyMapboxComponent(
  name: string,
  config: IIdentifyView['config'] = {},
) {
  const datasetPartIdentify = createDatasetPartIdentifyComponent(name, config);

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
          const ids = new Set<string>();

          features.forEach((x) => {
            const id =
              x.properties?.[self.config.field_id || 'id'] ?? x.id;
            if (!ids.has(id)) {
              ids.add(id);
            }
          });

          const idsGet = [...ids];
          logHelper(loggerIdentify, mapId, 'dataset', self.id)
            .with({ fn: 'getFeatures', span: 'identify.query' })
            .debug(
            'Map queryRenderedFeatures returned candidates for identify.',
            {
              featureCount: features.length,
              uniqueIdCount: idsGet.length,
            },
          );
          if (!idsGet || idsGet.length < 1) {
            resolve([]);
            return;
          }

          const fieldId = self.config.field_id || 'id';
          const fieldName = self.config.field_name || 'name';

          const toRows = (
            unique: Record<string, unknown>[],
          ): IdentifyFeatureRow[] =>
            unique.map((x, i) => ({
              id:
                (x[fieldId] as string | number | undefined) ??
                (x['id'] as string | number | undefined) ??
                i,
              name: String(x[fieldName] ?? ''),
              data: x,
            }));

          if (self.getList) {
            logHelper(loggerIdentify, mapId, 'dataset', self.id)
              .with({ fn: 'getFeatures', span: 'identify.query' })
              .debug(
              'Using identify getList to convert map features to rows.',
              { featureCount: features.length },
            );
            void self.getList(mapId, features).then((unique) => {
              const result = toRows(unique as Record<string, unknown>[]);
              logHelper(loggerIdentify, mapId, 'dataset', self.id)
                .with({ fn: 'getFeatures', span: 'identify.query' })
                .debug(
                'Identify getList conversion finished.',
                { rowCount: result.length },
              );
              resolve(result);
            });
            return;
          }

          // No getList: map rendered features to rows (dedupe by field id).
          const seen = new Set<string>();
          const rows: IdentifyFeatureRow[] = [];
          for (const feature of features) {
            const flat = convertFeatureToItem<Record<string, unknown>>(feature);
            const id =
              (flat[fieldId] as string | number | undefined) ??
              (flat['id'] as string | number | undefined) ??
              feature.id ??
              rows.length;
            const key = String(id);
            if (seen.has(key)) continue;
            seen.add(key);
            rows.push({
              id,
              name: String(flat[fieldName] ?? ''),
              data: flat,
            });
          }
          logHelper(loggerIdentify, mapId, 'dataset', self.id)
            .with({ fn: 'getFeatures', span: 'identify.query' })
            .debug('Identify mapbox getFeatures finished without getList.', {
            rowCount: rows.length,
          });
          resolve(rows);
        });
      });
    },
  });

  return self;
}
export function createIdentifyMapboxMergedComponent(
  name: string,
  config?: any,
  identifyGroupId = 'mapbox-group',
): IIdentifyViewWithMerge {
  const base = createDatasetPartIdentifyComponent(name, config);

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
    .debug(
    'start',
    { identifies, config: props, pointOrBox },
  );
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
      .debug(
      'convert',
      {
        point,
        x: point.x,
        y: point.y,
        config: props,
        pointOrBox,
      },
    );
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
    .debug(
    'handle',
    { groupMerge },
  );
  const result = await Promise.all(promises).then((res) => res.flat());
  if (signal?.aborted) {
    const err = new Error('Identify aborted');
    err.name = 'AbortError';
    throw err;
  }
  logHelper(loggerIdentify, mapId, 'MULTI', 'handleMultiIdentify')
    .with({ fn: 'handleMultiIdentify', span: 'identify.query' })
    .debug(
    'end',
    { result },
  );
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
  logHelper(
    loggerIdentify,
    mapId,
    'FIRST',
    'handleMultiIdentifyGetFirst',
  )
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
        logHelper(
          loggerIdentify,
          mapId,
          'FIRST',
          'handleMultiIdentifyGetFirst',
        )
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
      logHelper(
        loggerIdentify,
        mapId,
        'FIRST',
        'handleMultiIdentifyGetFirst',
      )
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
    logHelper(
      loggerIdentify,
      mapId,
      'FIRST',
      'handleMultiIdentifyGetFirst',
    )
      .with({ fn: 'handleMultiIdentifyGetFirst', span: 'identify.show-first' })
      .debug(
        'Show-first identify finished with no features under the pointer.',
      );
    return undefined;
  }

  const x = features[0];
  const datasetPartIdentify = cache[x.layer.id];
  let flat: Record<string, any> = convertFeatureToItem(x);
  if (datasetPartIdentify?.getList) {
    const list = await datasetPartIdentify.getList(mapId, [x]);
    if (list?.[0]) {
      flat = list[0] as Record<string, any>;
    }
  }

  if (signal?.aborted) {
    const err = new Error('Identify aborted');
    err.name = 'AbortError';
    throw err;
  }

  const id =
    flat[datasetPartIdentify?.config?.field_id || 'id'] ??
    flat['id'] ??
    x.id;
  const name =
    flat[datasetPartIdentify?.config?.field_name || 'name'] ??
    flat[datasetPartIdentify?.config?.field_id || 'id'] ??
    '';
  const result: IdentifyMultiResult = {
    identify: datasetPartIdentify,
    features: [
      {
        id,
        name: String(name ?? ''),
        data: flat,
      },
    ],
  };
  logHelper(
    loggerIdentify,
    mapId,
    'FIRST',
    'handleMultiIdentifyGetFirst',
  )
    .with({ fn: 'handleMultiIdentifyGetFirst', span: 'identify.show-first' })
    .debug('Show-first identify finished with a feature hit.', {
      datasetId: datasetPartIdentify?.id,
      featureId: id,
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
