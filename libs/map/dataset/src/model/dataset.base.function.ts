import type { IDataset } from '../interfaces';
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
