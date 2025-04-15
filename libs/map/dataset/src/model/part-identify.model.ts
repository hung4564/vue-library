import { getMap } from '@hungpvq/vue-map-core';
import type { MapSimple } from '@hungpvq/shared-map';
import type { MapboxGeoJSONFeature, PointLike } from 'mapbox-gl';
import type { IDataset } from '../interfaces/dataset.base';
import type {
  IIdentifyView,
  IMapboxLayerView,
  MenuAction,
} from '../interfaces/dataset.parts';
import { isMapboxLayerView } from '../utils/check';
import { DatasetLeaf } from './dataset.base';
import {
  findSiblingOrNearestLeaf,
  runAllComponentsWithCheck,
} from './dataset.visitors';
import { DatasetPartDataManagementComponent } from './part-data-management,model';

export abstract class DatasetPartIdentifyComponent
  extends DatasetLeaf<IIdentifyView['config']>
  implements IIdentifyView<DatasetPartIdentifyComponent>
{
  menus: MenuAction<DatasetPartIdentifyComponent>[] = [];
  override get type(): string {
    return 'identify';
  }
  get config(): IIdentifyView['config'] {
    return this.data || {};
  }
  abstract getFeatures(
    mapId: string,
    pointOrBox?: PointLike | [PointLike, PointLike]
  ): Promise<{ id: string; name: string; data: any }[]>;
}

export class IdentifyMapboxComponent extends DatasetPartIdentifyComponent {
  async getFeatures(
    mapId: string,
    pointOrBox?: PointLike | [PointLike, PointLike]
  ) {
    return new Promise<{ id: string; name: string; data: any }[]>((resolve) => {
      const results = runAllComponentsWithCheck(
        this.getParent() as IDataset,
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
          this,
          (dataset) => dataset.type == 'dataManagement'
        ) as DatasetPartDataManagementComponent;
        features.forEach((x) => {
          const id = x.properties?.[this.config.field_id || 'id'] ?? x.id;
          if (!ids.has(id)) {
            ids.add(id);
          }
        });
        const idsGet = [...ids];
        if (!idsGet || idsGet.length < 1) {
          resolve([]);
          return;
        }
        dataManagement.getData([...idsGet]).then((unique) => {
          resolve(
            unique.map((x, i) => ({
              id: x.id ?? i,
              name: x[this.config.field_name || 'name'] ?? '',
              data: x,
            }))
          );
        });
      });
    });
  }
}
