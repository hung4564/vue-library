import { logHelper, type MapSimple } from '@hungpvq/shared-map';
import { getMap } from '@hungpvq/vue-map-core';
import { Point, type MapGeoJSONFeature, type PointLike } from 'maplibre-gl';
import type { IDataset } from '../../interfaces/dataset.base';
import type {
  IDataManagementView,
  IdentifyResult,
  IIdentifyView,
  IIdentifyViewWithMerge,
  IMapboxLayerView,
} from '../../interfaces/dataset.parts';
import { loggerIdentify } from '../../logger';
import { isIdentifyMergeView, isMapboxLayerView } from '../../utils/check';
import { convertFeatureToItem } from '../../utils/convert';
import { createNamedComponent } from '../base';
import { createDatasetLeaf } from '../dataset.base.function';
import { createDatasetMenu } from '../menu';
import {
  findSiblingOrNearestLeaf,
  runAllComponentsWithCheck,
} from '../visitors';
import {
  getMergedFeatures,
  mergePayload,
  splitResponse,
} from './identifyMapboxMerged';
export function createDatasetPartIdentifyComponent<
  T extends IIdentifyView['config'],
>(name: string, config: T) {
  const base = createDatasetLeaf<T>(name, config);
  const menu = createDatasetMenu();

  return createNamedComponent('IdentifyComponent', {
    get config() {
      return config || {};
    },
    ...base,
    ...menu,
    get type(): string {
      return 'identify';
    },
    // Abstract method (phải được implement bởi component cụ thể)
    getFeatures(
      mapId: string,
      pointOrBox?: PointLike | [PointLike, PointLike],
    ): Promise<{ id: string; name: string; data: any }[]> {
      throw new Error('Method not implemented.');
    },
  });
}
export function createIdentifyMapboxComponent(name: string, config?: any) {
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
      logHelper(loggerIdentify, mapId, 'model').debug(
        'start',
        allLayerIds,
        pointOrBox,
      );
      getMap(mapId, (map: MapSimple) => {
        const features: MapGeoJSONFeature[] = map.queryRenderedFeatures(
          pointOrBox,
          {
            layers: allLayerIds.filter((id) => map.getLayer(id)),
          },
        );

        const ids = new Set<string>();
        const dataManagement = findSiblingOrNearestLeaf(
          datasetPartIdentify,
          (dataset) => dataset.type == 'dataManagement',
        ) as unknown as IDataManagementView;

        features.forEach((x) => {
          const id =
            x.properties?.[datasetPartIdentify.config.field_id || 'id'] ?? x.id;
          if (!ids.has(id)) {
            ids.add(id);
          }
        });

        const idsGet = [...ids];
        if (!idsGet || idsGet.length < 1) {
          resolve([]);
          return;
        }

        dataManagement.getList([...idsGet]).then((unique) => {
          const result = unique.map((x, i) => ({
            id: x.id ?? i,
            name: x[datasetPartIdentify.config.field_name || 'name'] ?? '',
            data: x,
          }));
          logHelper(loggerIdentify, mapId, 'model').debug('end', results);
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
): IIdentifyViewWithMerge {
  const base = createDatasetPartIdentifyComponent(name, config);

  const identifyGroupId = 'mapbox-group';

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
): Promise<IdentifyResult> {
  return identify.getFeatures(mapId, pointOrBox).then((features) => ({
    identify,
    features,
  }));
}

function handleMergedIdentifyGroup(
  mergeIdentifies: IIdentifyViewWithMerge[],
  mapId: string,
  pointOrBox?: PointLike | [PointLike, PointLike],
): Promise<IdentifyResult[]> {
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
): Promise<IdentifyResult[]> {
  logHelper(loggerIdentify, mapId, 'multi').debug(
    'start',
    identifies,
    props.selectThreshold,
    pointOrBox,
  );
  const promises: Promise<IdentifyResult | IdentifyResult[]>[] = [];
  const groupMerge: Record<string, IIdentifyViewWithMerge[]> = {};
  if (pointOrBox && isPointLike(pointOrBox)) {
    const point = getXY(pointOrBox);
    pointOrBox = [
      [point.x - props.selectThreshold, point.y + props.selectThreshold], // bottom left (SW)
      [point.x + props.selectThreshold, point.y - props.selectThreshold], // top right (NE)
    ];
    logHelper(loggerIdentify, mapId, 'multi').debug(
      'convert',
      point,
      point.x,
      point.y,
      props.selectThreshold,
      pointOrBox,
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
  const result = await Promise.all(promises).then((res) => res.flat());
  logHelper(loggerIdentify, mapId, 'getFirst').debug('end', result);
  return result;
}

export async function handleMultiIdentifyGetFirst(
  identifies: IIdentifyView[],
  mapId: string,
  pointOrBox?: PointLike | [PointLike, PointLike],
  props = { selectThreshold: 5 },
): Promise<IdentifyResult> {
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
  logHelper(loggerIdentify, mapId, 'getFirst').debug(
    'start',
    allLayerIds,
    pointOrBox,
  );
  return new Promise((resolve) => {
    getMap(mapId, (map: MapSimple) => {
      if (pointOrBox && isPointLike(pointOrBox)) {
        const point = getXY(pointOrBox);
        pointOrBox = [
          [point.x - props.selectThreshold, point.y + props.selectThreshold], // bottom left (SW)
          [point.x + props.selectThreshold, point.y - props.selectThreshold], // top right (NE)
        ];
        logHelper(loggerIdentify, mapId, 'getFirst').debug(
          'convert',
          point,
          point.x,
          point.y,
          props.selectThreshold,
          pointOrBox,
        );
      }
      const features: MapGeoJSONFeature[] = map.queryRenderedFeatures(
        pointOrBox,
        {
          layers: allLayerIds.filter((id) => map.getLayer(id)),
        },
      );
      logHelper(loggerIdentify, mapId, 'getFirst').debug(
        'current',
        allLayerIds.filter((id) => map.getLayer(id)),
        features,
        pointOrBox,
      );
      if (features.length > 0) {
        const x = features[0];
        const datasetPartIdentify = cache[x.layer.id];
        const id =
          x.properties?.[datasetPartIdentify?.config?.field_id || 'id'] ?? x.id;
        const name =
          x.properties?.[datasetPartIdentify?.config?.field_name || 'id'] ??
          x.id;
        const result = {
          identify: datasetPartIdentify,
          layer: x.layer,
          feature: {
            id,
            name,
            data: convertFeatureToItem(x),
          },
        };
        logHelper(loggerIdentify, mapId, 'getFirst').debug('end', result);
        resolve(result);
      }
    });
  });
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
