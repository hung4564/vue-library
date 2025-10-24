import type { IDataset } from '../interfaces/dataset.base';
import type { IDatasetVisitor } from '../interfaces/dataset.visitor';
import { Base } from './base';

/**
 * The base DatasetComponent class declares common operations for both simple and
 * complex objects of a composition.
 */
abstract class DatasetComponent<T = any> extends Base implements IDataset {
  protected parent?: IDataset;
  protected name: string;
  protected data?: T;
  abstract type: string;
  dependsOn?: string[] = [];

  constructor(name: string, data?: T) {
    super();
    this.name = name;
    this.data = data;
  }
  public setParent(parent?: IDataset) {
    this.parent = parent;
  }

  public getParent(): IDataset | undefined {
    return this.parent;
  }
  /**
   * Accept a visitor
   * This method is part of the Visitor pattern
   * @param visitor The visitor to accept
   * @returns The result of the visitor's visit
   */
  accept(visitor: IDatasetVisitor): any {
    // By default, leaf nodes are visited as leaves
    return visitor.visitLeaf(this);
  }

  getName(): string {
    return this.name;
  }

  setName(name: string) {
    this.name = name;
  }

  getData(): any {
    return this.data;
  }
  setData(data: any) {
    this.data = data;
  }

  addDependsOn(input: string | IDataset): void {
    const id = typeof input === 'string' ? input : input.id;
    if (!this.dependsOn) this.dependsOn = [];
    if (!this.dependsOn.includes(id)) {
      this.dependsOn.push(id);
    }
  }

  removeDependsOn(input: string | IDataset): void {
    const id = typeof input === 'string' ? input : input.id;
    if (!this.dependsOn) this.dependsOn = [];
    this.dependsOn = this.dependsOn.filter((dep) => dep !== id);
  }
}
/**
 * Leaf node in the Dataset Composite pattern
 * Represents a single dataset without children
 */
export class DatasetLeaf<T = any> extends DatasetComponent<T> {
  get type(): string {
    return 'leaf';
  }

  constructor(name: string, data?: T) {
    super(name, data);
  }

  /**
   * Accept a visitor
   * @param visitor The visitor to accept
   * @returns The result of the visitor's visit
   */
  override accept(visitor: IDatasetVisitor): any {
    return visitor.visitLeaf(this);
  }
}
/**
 * Composite node in the Dataset Composite pattern
 * Represents a dataset that can contain other datasets
 */
export class DatasetComposite extends DatasetComponent {
  get type(): string {
    return 'composite';
  }
  private children: IDataset[] = [];

  constructor(name: string) {
    super(name);
  }

  add(dataset: IDataset): void {
    this.children.push(dataset);
    if (typeof dataset?.setParent === 'function') {
      dataset.setParent(this);
    }
  }

  remove(dataset: IDataset): void {
    const index = this.children.findIndex(
      (child) => child === dataset || child.id === dataset.id,
    );
    if (index !== -1) {
      this.children.splice(index, 1);
      if (typeof dataset?.setParent === 'function') {
        dataset.setParent(undefined);
      }
    }
  }

  getChildren(): IDataset[] {
    return [...this.children];
  }
}

/**
 * Factory function to create a dataset
 * @param name The name of the dataset
 * @param data Optional data for leaf nodes
 * @param isComposite Whether to create a composite node
 * @returns A new dataset instance
 */
export function createDataset(
  name: string,
  data?: any,
  isComposite?: false,
): DatasetLeaf;
export function createDataset(
  name: string,
  data?: any,
  isComposite?: true,
): DatasetComposite;
export function createDataset(
  name: string,
  data?: any,
  isComposite = false,
): IDataset {
  if (isComposite) {
    return new DatasetComposite(name);
  } else {
    return new DatasetLeaf(name, data);
  }
}

export function createRootDataset(name: string): DatasetComposite {
  return new DatasetComposite(name);
}

export function createGroupDataset(name: string): DatasetComposite {
  return new DatasetComposite(name);
}
