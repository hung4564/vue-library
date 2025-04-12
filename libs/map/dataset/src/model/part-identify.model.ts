import { getMap } from '@hungpvq/vue-map-core';
import { MapboxGeoJSONFeature, PointLike } from 'mapbox-gl';
import { IDataset } from '../interfaces/dataset.base';
import {
  IIdentifyView,
  IMapboxLayerView,
  MenuAction,
} from '../interfaces/dataset.parts';
import { isMapboxLayerView } from '../utils/check';
import { DatasetLeaf } from './dataset.base';
import { runAllComponentsWithCheck } from './dataset.visitors';

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
      getMap(mapId, (map) => {
        const features: MapboxGeoJSONFeature[] = map.queryRenderedFeatures(
          pointOrBox,
          {
            layers: allLayerIds,
          }
        );

        const unique: MapboxGeoJSONFeature[] = [];
        const ids = new Set();
        features.forEach((x) => {
          const id = x.properties?.[this.config.field_id || 'id'] ?? x.id;
          if (!ids.has(id)) {
            unique.push(x);
            ids.add(id);
          }
        });
        resolve(
          unique.map((x, i) => ({
            id: x.properties?.[this.config.field_id || 'id'] ?? x.id ?? i,
            name: x.properties?.[this.config.field_name || 'name'] ?? '',
            data: {
              ...x.properties,
              geometry: x.geometry,
            },
          }))
        );
      });
    });
  }
}
