import type { IDataset, WithChildren } from '../interfaces';
import { createBase } from './base';

function addDependsOnImpl(this: IDataset, input: string | IDataset): void {
  const id = typeof input === 'string' ? input : input.id;
  if (!id) return;
  if (!this.dependsOn) this.dependsOn = [];
  if (!this.dependsOn.includes(id)) this.dependsOn.push(id);
}
function removeDependsOnImpl(this: IDataset, input: string | IDataset): void {
  const id = typeof input === 'string' ? input : input.id;
  if (!id || !this.dependsOn) return;
  this.dependsOn = this.dependsOn.filter((d) => d !== id);
}

export function createDatasetComponent(name: string): IDataset {
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
    addDependsOn: addDependsOnImpl,
    removeDependsOn: removeDependsOnImpl,
  };
}
export function createDatasetLeaf(name: string) {
  const base = createDatasetComponent(name);

  return {
    ...base,
    type: 'leaf',
    addDependsOn: addDependsOnImpl,
    removeDependsOn: removeDependsOnImpl,
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
