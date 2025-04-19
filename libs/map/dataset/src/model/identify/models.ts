import type { MapSimple } from '@hungpvq/shared-map';
import { getMap } from '@hungpvq/vue-map-core';
import type { MapboxGeoJSONFeature, PointLike } from 'mapbox-gl';
import type { IDataset } from '../../interfaces/dataset.base';
import type {
  IdentifyResult,
  IIdentifyView,
  IIdentifyViewWithMerge,
  IMapboxLayerView,
} from '../../interfaces/dataset.parts';
import { isIdentifyMergeView, isMapboxLayerView } from '../../utils/check';
import { createDatasetLeaf } from '../dataset.base.function';
import {
  findSiblingOrNearestLeaf,
  runAllComponentsWithCheck,
} from '../dataset.visitors';
import { DatasetPartDataManagementComponent } from '../part-data-management,model';
import { createDatasetMenu } from '../part-menu.model';
import {
  getMergedFeatures,
  mergePayload,
  splitResponse,
} from './identifyMapboxMerged';
export function createDatasetPartIdentifyComponent<
  T extends IIdentifyView['config']
>(name: string, config: T) {
  const base = createDatasetLeaf<T>(name, config);
  const menu = createDatasetMenu();

  return {
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
      pointOrBox?: PointLike | [PointLike, PointLike]
    ): Promise<{ id: string; name: string; data: any }[]> {
      throw new Error('Method not implemented.');
    },
  };
}
export function createIdentifyMapboxComponent(name: string, config?: any) {
  const datasetPartIdentify = createDatasetPartIdentifyComponent(name, config);

  const getFeatures = async (
    mapId: string,
    pointOrBox?: PointLike | [PointLike, PointLike]
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
        ]
      );

      const allLayerIds: string[] = Array.from(results.values()).flat(2);
      getMap(mapId, (map: MapSimple) => {
        const features: MapboxGeoJSONFeature[] = map.queryRenderedFeatures(
          pointOrBox,
          {
            layers: allLayerIds,
          }
        );

        const ids = new Set<string>();
        const dataManagement = findSiblingOrNearestLeaf(
          datasetPartIdentify,
          (dataset) => dataset.type == 'dataManagement'
        ) as DatasetPartDataManagementComponent;

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
          resolve(
            unique.map((x, i) => ({
              id: x.id ?? i,
              name: x[datasetPartIdentify.config.field_name || 'name'] ?? '',
              data: x,
            }))
          );
        });
      });
    });
  };

  return {
    ...datasetPartIdentify,
    getFeatures,
  };
}
export function createIdentifyMapboxMergedComponent(
  name: string,
  config?: any
): IIdentifyViewWithMerge {
  const base = createDatasetPartIdentifyComponent(name, config);

  const identifyGroupId = 'mapbox-group';

  return {
    ...base,
    identifyGroupId,
    mergePayload,
    getMergedFeatures,
    splitResponse,
  };
}

function handleSingleIdentify(
  identify: IIdentifyView,
  mapId: string,
  pointOrBox?: PointLike | [PointLike, PointLike]
): Promise<IdentifyResult> {
  return identify.getFeatures(mapId, pointOrBox).then((features) => ({
    identify,
    features,
  }));
}

function handleMergedIdentifyGroup(
  mergeIdentifies: IIdentifyViewWithMerge[],
  mapId: string,
  pointOrBox?: PointLike | [PointLike, PointLike]
): Promise<IdentifyResult[]> {
  const mergedIdentify = mergeIdentifies[0];

  if (mergeIdentifies.length === 1) {
    return handleSingleIdentify(mergedIdentify, mapId, pointOrBox).then(
      (res) => [res]
    );
  }

  const payload = mergedIdentify.mergePayload(
    mergeIdentifies,
    mapId,
    pointOrBox
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
  pointOrBox?: PointLike | [PointLike, PointLike]
): Promise<IdentifyResult[]> {
  const promises: Promise<IdentifyResult | IdentifyResult[]>[] = [];
  const groupMerge: Record<string, IIdentifyViewWithMerge[]> = {};

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
      handleMergedIdentifyGroup(mergeIdentifies, mapId, pointOrBox)
    );
  }

  return Promise.all(promises).then((res) => res.flat());
}
