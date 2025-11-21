import type { MapSimple } from '@hungpvq/shared-map';
import type { SourceSpecification } from 'maplibre-gl';
import { createWithDataHelper } from '../../extra';
import type { IBaseMapboxSourceView } from '../../interfaces';
import { createNamedComponent } from '../base';
import { createDatasetLeaf } from '../dataset.base.function';

export function createDatasetPartMapboxSourceComponent<T>(
  name: string,
  data: T,
): IBaseMapboxSourceView {
  const base = createDatasetLeaf(name);
  const dataHelper = createWithDataHelper<T>(data);
  return createNamedComponent('DatasetPartMapboxSourceComponent', {
    ...base,
    ...dataHelper,
    get type() {
      return 'source';
    },
    getSourceId() {
      const source = this.getMapboxSource();
      const source_id = source.id || base.id;
      return source_id;
    },
    addToMap(map: MapSimple) {
      const source_id = this.getSourceId();
      if (source_id && !map.getSource(source_id)) {
        map.addSource(source_id, this.getMapboxSource());
      }
    },
    removeFromMap(map: MapSimple) {
      const source_id = this.getSourceId();
      if (source_id && map.getSource(source_id)) {
        map.removeSource(source_id);
      }
    },
    getMapboxSource(): SourceSpecification & { id?: string } {
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
