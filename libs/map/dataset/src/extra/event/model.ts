import mitt, { type Emitter } from 'mitt';
import type { IDataset } from '../../interfaces';
import type { WithEvent } from './types';
export function addDatasetWithEvent<
  T extends IDataset = IDataset,
  E extends Record<string, any> = any,
>(parent: T): T & WithEvent<E> {
  const menu = createDatasetEvent<E>();

  return Object.assign(parent, menu);
}

export function createDatasetEvent<
  E extends Record<string, any> = any,
>(): WithEvent<E> {
  const emitter: Emitter<E> = mitt<E>();
  return { emit: emitter.emit, on: emitter.on, off: emitter.off };
}
