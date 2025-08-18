import type { MapSimple } from '@hungpvq/shared-map';
import { createDatasetMenu } from '../../extra/menu';
import type { IDataset, IMapboxLayerView } from '../../interfaces';
import type { ComponentType } from '../../types';
import { createNamedComponent } from '../base';
import { createDatasetLeaf } from '../dataset.base.function';

export function createDatasetPartMapboxLayerComponent<T = any>(
  name: string,
  data: T,
): IMapboxLayerView & IDataset<T> {
  const base = createDatasetLeaf<T>(name, data);
  const menu = createDatasetMenu();

  return createNamedComponent('DatasetPartMapboxLayerComponent', {
    ...base,
    ...menu,
    get type() {
      return 'layer';
    },

    getBeforeId(): string {
      throw new Error('Method not implemented.');
    },
    getAllLayerIds(): string[] {
      throw new Error('Method not implemented.');
    },
    addToMap(map: MapSimple, beforeId?: string): void {
      throw new Error('Method not implemented.');
    },
    removeFromMap(map: MapSimple): void {
      throw new Error('Method not implemented.');
    },
    moveLayer(map: MapSimple, beforeId: string): void {
      throw new Error('Method not implemented.');
    },
    toggleShow(map: MapSimple, show?: boolean): void {
      throw new Error('Method not implemented.');
    },
    setOpacity(map: MapSimple, opacity: number): void {
      throw new Error('Method not implemented.');
    },
    updateValue(map: MapSimple, value: any): void {
      throw new Error('Method not implemented.');
    },
    getComponentUpdate(): ComponentType {
      throw new Error('Method not implemented.');
    },
  });
}
