import type { MapSimple } from '@hungpvq/shared-map';
import type { AnySourceData } from 'mapbox-gl';
import type { IDataset, IMapboxSourceView } from '../../interfaces';
import { createNamedComponent } from '../base';
import { createDatasetLeaf } from '../dataset.base.function';

export function createDatasetPartMapboxSourceComponent<T = any>(
  name: string,
  data: T
): IDataset & IMapboxSourceView {
  const base = createDatasetLeaf<T>(name, data);
  return createNamedComponent('DatasetPartMapboxSourceComponent', {
    ...base,

    get type() {
      return 'source';
    },
    addToMap(map: MapSimple) {
      if (base.id && !map.getSource(base.id)) {
        map.addSource(base.id, this.getMapboxSource());
      }
    },
    removeFromMap(map: MapSimple) {
      if (base.id && map.getLayer(base.id + '-hightLight')) {
        map.removeLayer(base.id + '-hightLight');
      }
      if (base.id && map.getSource(base.id)) {
        map.removeSource(base.id);
      }
    },
    getMapboxSource(): AnySourceData {
      throw new Error('Method not implemented.');
    },
    getFieldsInfo(): any[] {
      throw new Error('Method not implemented.');
    },
    getDataInfo(): any {
      throw new Error('Method not implemented.');
    },
  });
}
