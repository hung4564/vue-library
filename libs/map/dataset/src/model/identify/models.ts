import { logHelper, type MapSimple } from '@hungpvq/shared-map';
import { getMap } from '@hungpvq/vue-map-core';
import { Point, type MapGeoJSONFeature, type PointLike } from 'maplibre-gl';
import {
  createMenuClickAddComponentBuilder,
  createMenuClickBuilder,
  createMenuClickHighlightBuilder,
  createWithMenuHelper,
  handleMenuActionClick,
} from '../../extra';
import type { IDataset } from '../../interfaces/dataset.base';
import type {
  IDataManagementView,
  IdentifyResult,
  IdentifySingleResult,
  IIdentifyView,
  IIdentifyViewWithMerge,
  IMapboxLayerView,
  MenuItemCommon,
} from '../../interfaces/dataset.parts';
import { loggerIdentify } from '../../logger';
import { isIdentifyMergeView, isMapboxLayerView } from '../../utils/check';
import { convertFeatureToItem } from '../../utils/convert';
import { createNamedComponent } from '../base';
import { createDatasetLeaf } from '../dataset.base.function';
import {
  findSiblingOrNearestLeaf,
  runAllComponentsWithCheck,
} from '../visitors';
import {
  getMergedFeatures,
  mergePayload,
  splitResponse,
} from './identifyMapboxMerged';
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
    showDetail(mapId: string, feature: MapGeoJSONFeature) {
      const clickBuilder = createMenuClickBuilder().addTupleDynamic(
        'highlight',
        () => ({
          value: createMenuClickHighlightBuilder()
            .setDetail(convertFeatureToItem(feature))
            .setKey('detail')
            .build(),
        }),
      );
      if (config.fields && config.fields.length > 0) {
        clickBuilder.addTupleDynamic('addComponent', ({ layer }) => ({
          value: createMenuClickAddComponentBuilder()
            .setComponentKey('layer-detail')
            .setAttr({
              item: convertFeatureToItem(feature),
              fields: config.fields,
              view: layer,
            })
            .setCheck('detail')
            .build(),
        }));
      }
      // build ra MenuItemClick
      const menus: MenuItemCommon<any>['click'] = clickBuilder.build();
      handleMenuActionClick(menus, { layer: dataset, mapId, value: feature });
    },
  });
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
        const dataManagement = findSiblingOrNearestLeaf(
          datasetPartIdentify,
          (dataset) => dataset.type == 'dataManagement',
        ) as unknown as IDataManagementView;
        if (dataManagement) {
          logHelper(
            loggerIdentify,
            mapId,
            'dataset',
            datasetPartIdentify.id,
          ).debug('dataManagement', dataManagement);
          handle = () => dataManagement.getList([...idsGet], features);
        } else if (datasetPartIdentify.getList) {
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
  logHelper(loggerIdentify, mapId, 'MULTI', 'handleMultiIdentify').debug(
    'start',
    { identifies, config: props, pointOrBox },
  );
  const promises: Promise<IdentifyResult | IdentifyResult[]>[] = [];
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
): Promise<IdentifySingleResult> {
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
  return new Promise((resolve) => {
    getMap(mapId, (map: MapSimple) => {
      if (pointOrBox && isPointLike(pointOrBox)) {
        const point = getXY(pointOrBox);
        pointOrBox = [
          [point.x - props.selectThreshold, point.y + props.selectThreshold], // bottom left (SW)
          [point.x + props.selectThreshold, point.y - props.selectThreshold], // top right (NE)
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
          pointOrBox,
        });
      }
      const features: MapGeoJSONFeature[] = map.queryRenderedFeatures(
        pointOrBox,
        {
          layers: allLayerIds.filter((id) => map.getLayer(id)),
        },
      );
      logHelper(
        loggerIdentify,
        mapId,
        'FIRST',
        'handleMultiIdentifyGetFirst',
      ).debug('current', {
        allLayerIds: allLayerIds.filter((id) => map.getLayer(id)),
        features,
        pointOrBox,
      });
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
            data: x,
          },
        };
        logHelper(
          loggerIdentify,
          mapId,
          'FIRST',
          'handleMultiIdentifyGetFirst',
        ).debug('end', { result });
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
