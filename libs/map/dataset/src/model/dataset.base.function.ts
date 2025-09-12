import type { IDataset, WithChildren } from '../interfaces';
import { createBase } from './base';

export function createDatasetComponent<T = any>(name: string): IDataset {
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

    setParent(newParent?: ReturnType<typeof createDatasetComponent>) {
      parent = newParent;
    },
    getParent(): ReturnType<typeof createDatasetComponent> | undefined {
      return parent;
    },
  };
}
export function createDatasetLeaf<T = any>(name: string) {
  const base = createDatasetComponent<T>(name);

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
