import type { MapSimple } from '@hungpvq/shared-map';
import {
  createWithDataHelper,
  createWithMenuHelper,
  type WithDataHelper,
} from '../../extra';
import type { IDataset, IMapboxLayerView } from '../../interfaces';
import type { ComponentType } from '../../types';
import { createDatasetLeaf } from '../dataset.base.function';

export function createDatasetPartMapboxLayerComponent<T = any>(
  name: string,
  data: T,
): IMapboxLayerView & WithDataHelper<T> & IDataset {
  const base = createDatasetLeaf(name);
  const menu = createWithMenuHelper();
  const dataHelper = createWithDataHelper<T>(data);
  return {
    ...base,
    ...menu,
    ...dataHelper,
    get type() {
      return 'layer';
    },
    getLayers() {
      throw new Error('Method not implemented.');
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
  };
}
