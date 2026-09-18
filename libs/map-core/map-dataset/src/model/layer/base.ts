import type { MapSimple } from '@hungpvq/map-core';
import {
  createWithDataHelper,
  type WithDataHelper,
} from '../../extra/data';
import { createWithMenuHelper } from '../../menu/items';
import type { IDataset } from '../../interfaces/dataset.base';
import type { IMapboxLayerView } from '../../interfaces/dataset.parts';
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
    addToMap(_map: MapSimple, _beforeId?: string): void {
      throw new Error('Method not implemented.');
    },
    removeFromMap(_map: MapSimple): void {
      throw new Error('Method not implemented.');
    },
    moveLayer(_map: MapSimple, _beforeId: string): void {
      throw new Error('Method not implemented.');
    },
    toggleShow(_map: MapSimple, _show?: boolean): void {
      throw new Error('Method not implemented.');
    },
    setOpacity(_map: MapSimple, _opacity: number): void {
      throw new Error('Method not implemented.');
    },
    updateValue(_map: MapSimple, _value: any): void {
      throw new Error('Method not implemented.');
    },
    getComponentUpdate(): ComponentType {
      throw new Error('Method not implemented.');
    },
  };
}
