import type { IDataset, IDatasetVisitor } from '../interfaces';
import { createBase } from './base';

export function createDatasetComponent<T = any>(
  name: string,
  data?: T
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
    accept(visitor: IDatasetVisitor): any {
      return visitor.visitLeaf(this); // default behavior
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
