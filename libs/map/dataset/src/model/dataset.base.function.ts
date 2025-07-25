import type { IDataset, WithChildren, WithEvent } from '../interfaces';
import { createBase } from './base';

export function createDatasetComponent<T = any>(
  name: string,
  data?: T,
): IDataset {
  let parent: ReturnType<typeof createDatasetComponent> | undefined;

  const base = createBase();
  return {
    ...base,
    type: 'base',

    getName(): string {
      return name;
    },

    setName(newName: string) {
      name = newName;
    },

    getData(): T | undefined {
      return data;
    },

    setData(newData: T) {
      data = newData;
    },

    setParent(newParent?: ReturnType<typeof createDatasetComponent>) {
      parent = newParent;
    },
    getParent(): ReturnType<typeof createDatasetComponent> | undefined {
      return parent;
    },

    isComposite(): boolean {
      return false;
    },
  };
}
export function createDatasetLeaf<T = any>(name: string, data?: T) {
  const base = createDatasetComponent<T>(name, data);

  return {
    ...base,
    type: 'leaf',
  };
}

export function addDatasetWithChildren<T extends IDataset = IDataset>(
  parent: T,
): T & WithChildren {
  const children: IDataset[] = [];

  return Object.assign(parent, {
    add(dataset: IDataset) {
      children.push(dataset);
      dataset.setParent?.(parent);
    },
    remove(dataset: IDataset) {
      const index = children.findIndex(
        (child) => child === dataset || child.id === dataset.id,
      );
      if (index !== -1) {
        children.splice(index, 1);
        dataset.setParent?.(undefined);
      }
    },
    getChildren() {
      return [...children];
    },
  });
}

import mitt, { type Emitter } from 'mitt';
export function addDatasetWithEvent<
  T extends IDataset = IDataset,
  E extends Record<string, any> = any,
>(parent: T): T & WithEvent<E> {
  const emitter: Emitter<E> = mitt<E>();

  return Object.assign(parent, {
    emit: emitter.emit,
    on: emitter.on,
    off: emitter.off,
  });
}
