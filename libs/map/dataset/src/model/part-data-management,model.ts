import type { MapSimple } from '@hungpvq/shared-map';
import type { IDataManagementView, IDatasetMap } from '../interfaces';
import LayerDetail from '../modules/LayerDetail/LayerDetail.vue';
import { addComponent, setFeatureHighlight } from '../store';
import { DatasetLeaf } from './dataset.base';
import { findSiblingOrNearestLeaf } from './dataset.visitors';
import { GeojsonSource } from './part-mapbox-source.model';

export abstract class DatasetPartDataManagementComponent<D = any>
  extends DatasetLeaf<{
    fields: { trans?: string; text?: string; value: string }[];
  }>
  implements IDataManagementView<D>
{
  override get type(): string {
    return 'dataManagement';
  }
  abstract showDetail(mapId: string, detail: D): void;
  abstract getList(ids?: string[]): Promise<D[]>;
  get fields() {
    return this.data?.fields;
  }
}

export class DataManagementMapboxComponent<
    D extends {
      id: string;
      geometry: { type: string; coordinates: any[] };
    } = any
  >
  extends DatasetPartDataManagementComponent<D>
  implements IDatasetMap
{
  protected items: D[] = [];
  addToMap(map: MapSimple): void {
    this.getList().then((items) => {
      const source = findSiblingOrNearestLeaf(
        this,
        (dataset) => dataset.type == 'source'
      ) as GeojsonSource;
      if (source) {
        source.updateData(map, {
          type: 'FeatureCollection',
          features: items.map((x) => {
            const { geometry, ...properties } = x;
            return { type: 'Feature', geometry, properties };
          }),
        });
      }
    });
  }
  removeFromMap(map: MapSimple): void {
    console.warn('not support');
  }
  setItems(items: D[]) {
    this.items = items;
  }
  getList(ids?: string[]): Promise<any[]> {
    return new Promise((resolve) => {
      if (!ids) {
        resolve(this.items);
        return;
      }
      const filteredItems = this.items.filter((item) => ids.includes(item.id));
      resolve(filteredItems);
    });
  }
  showDetail(mapId: string, detail: any): void {
    addComponent(mapId, {
      component: () => LayerDetail,
      attr: {
        item: detail,
        fields: this.fields,
        view: this,
      },
    });
    const { geometry, ...properties } = detail;
    setFeatureHighlight(
      mapId,
      {
        type: 'Feature',
        geometry,
        properties,
      },
      'detail'
    );
  }
}
