import mitt, { type Emitter } from 'mitt';
import type { IDataset } from '../../interfaces';
import type { WithEventHelper } from './types';
export function addDatasetWithEvent<
  T extends IDataset = IDataset,
  E extends Record<string, any> = any,
>(parent: T): T & WithEventHelper<E> {
  const menu = createWithEventHelper<E>();

  return Object.assign(parent, menu);
}

export function createWithEventHelper<
  E extends Record<string, any> = any,
>(): WithEventHelper<E> {
  const emitter: Emitter<E> = mitt<E>();
  return { emit: emitter.emit, on: emitter.on, off: emitter.off };
}
