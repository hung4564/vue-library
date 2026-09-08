import { getMap, logHelper, type MapSimple } from '@hungpvq/map-core';
import { Point, type MapGeoJSONFeature, type PointLike } from 'maplibre-gl';
import type {
  IDataset,
  IdentifyMultiResult,
  IIdentifyView,
  IIdentifyViewWithMerge,
  IMapboxLayerView,
} from '../../interfaces';
import { convertFeatureToItem } from '../../utils';
import { createDatasetLeaf } from '../dataset.base.function';
import { createNamedComponent } from '../base';
import { createWithMenuHelper } from '../../extra';
import {
  createMenuItemShowDetailForItem,
  LIST_VIEW_MENU_ID,
} from '../../extra/menu';
import { isIdentifyMergeView, isMapboxLayerView } from '../../utils/check';
import { runAllComponentsWithCheck } from '../visitors';
import { loggerIdentify } from '../../logger';
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
      mapId: string,
      pointOrBox?: PointLike | [PointLike, PointLike],
    ): Promise<{ id: string; name: string; data: any }[]> {
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

  const getFeatures = async (
    mapId: string,
    pointOrBox?: PointLike | [PointLike, PointLike],
  ): Promise<{ id: string; name: string; data: any }[]> => {
    return new Promise<{ id: string; name: string; data: any }[]>((resolve) => {
      const results = runAllComponentsWithCheck(
        datasetPartIdentify.getParent() || datasetPartIdentify,
        (dataset): dataset is IDataset & IMapboxLayerView =>
          isMapboxLayerView(dataset),
        [
          (dataset) => {
            return dataset.getAllLayerIds();
          },
        ],
      );

      const allLayerIds: string[] = Array.from(results.values()).flat(2);
      logHelper(loggerIdentify, mapId, 'dataset', datasetPartIdentify.id).debug(
        'start',
        {
          allLayerIds,
          pointOrBox,
        },
      );
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
            x.properties?.[datasetPartIdentify.config.field_id || 'id'] ?? x.id;
          if (!ids.has(id)) {
            ids.add(id);
          }
        });

        const idsGet = [...ids];
        logHelper(
          loggerIdentify,
          mapId,
          'dataset',
          datasetPartIdentify.id,
        ).debug('getFeatureFormMap', {
          features,
          idsGet,
        });
        if (!idsGet || idsGet.length < 1) {
          resolve([]);
          return;
        }
        let handle: (() => Promise<any[]>) | undefined;
        if (datasetPartIdentify.getList) {
          logHelper(
            loggerIdentify,
            mapId,
            'dataset',
            datasetPartIdentify.id,
          ).debug('use get list of identify', datasetPartIdentify);
          handle = () => datasetPartIdentify.getList!(mapId, features);
        }
        if (handle)
          handle().then((unique) => {
            const result = unique.map((x, i) => ({
              id: x[datasetPartIdentify.config.field_id || 'id'] ?? x.id ?? i,
              name: x[datasetPartIdentify.config.field_name || 'name'] ?? '',
              data: x,
            }));
            logHelper(
              loggerIdentify,
              mapId,
              'dataset',
              datasetPartIdentify.id,
            ).debug('end', { results });
            resolve(result);
          });
      });
    });
  };

  return createNamedComponent('IdentifyMapboxComponent', {
    ...datasetPartIdentify,
    getFeatures,
  });
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

  return mergedIdentify
    .getMergedFeatures(mergeIdentifies, payload)
    .then((response: any) => {
      return mergedIdentify.splitResponse(mergeIdentifies, payload, response);
    });
}

export async function handleMultiIdentify(
  identifies: IIdentifyView[],
  mapId: string,
  pointOrBox?: PointLike | [PointLike, PointLike],
  props = { selectThreshold: 5 },
): Promise<IdentifyMultiResult[]> {
  logHelper(loggerIdentify, mapId, 'MULTI', 'handleMultiIdentify').debug(
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
    logHelper(loggerIdentify, mapId, 'MULTI', 'handleMultiIdentify').debug(
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

  logHelper(loggerIdentify, mapId, 'MULTI', 'handleMultiIdentify').debug(
    'handle',
    { groupMerge },
  );
  const result = await Promise.all(promises).then((res) => res.flat());
  logHelper(loggerIdentify, mapId, 'MULTI', 'handleMultiIdentify').debug(
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
): Promise<IdentifyMultiResult | undefined> {
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
  ).debug('start', {
    identifies,
    allLayerIds,
    pointOrBox,
    config: props,
  });

  const features = await new Promise<MapGeoJSONFeature[]>((resolve) => {
    getMap(mapId, (map: MapSimple) => {
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
        ).debug('convert', {
          point,
          x: point.x,
          y: point.y,
          selectThreshold: props.selectThreshold,
          pointOrBox: queryBox,
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
      ).debug('current', {
        allLayerIds: allLayerIds.filter((id) => map.getLayer(id)),
        features: queried,
        pointOrBox: queryBox,
      });
      resolve(queried);
    });
  });

  if (features.length < 1) {
    logHelper(
      loggerIdentify,
      mapId,
      'FIRST',
      'handleMultiIdentifyGetFirst',
    ).debug('end', { result: undefined });
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
  ).debug('end', { result });
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
  if (point instanceof Point || isObjectWithXY(point)) {
    return { x: point.x, y: point.y };
  } else {
    return { x: point[0], y: point[1] };
  }
}
