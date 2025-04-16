import type { MapSimple } from '@hungpvq/shared-map';
import { getMap } from '@hungpvq/vue-map-core';
import type { MapboxGeoJSONFeature, PointLike } from 'mapbox-gl';
import type { IDataset } from '../interfaces/dataset.base';
import type {
  IIdentifyView,
  IMapboxLayerView,
  MenuAction,
} from '../interfaces/dataset.parts';
import { isMapboxLayerView } from '../utils/check';
import { createDatasetLeaf } from './dataset.base.function';
import {
  findSiblingOrNearestLeaf,
  runAllComponentsWithCheck,
} from './dataset.visitors';
import { DatasetPartDataManagementComponent } from './part-data-management,model';
import { createDatasetMenu } from './part-menu.model';

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
