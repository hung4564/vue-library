import { IDataset } from '../interfaces/dataset.base';
import { IDatasetVisitor } from '../interfaces/dataset.visitor';
import { Base } from './base';

/**
 * The base DatasetComponent class declares common operations for both simple and
 * complex objects of a composition.
 */
abstract class DatasetComponent<T = any> extends Base implements IDataset {
  protected parent?: DatasetComponent;
  protected name: string;
  protected data?: T;
  abstract type: string;
  constructor(name: string, data?: T) {
    super();
    this.name = name;
    this.data = data;
  }
  public setParent(parent?: DatasetComponent) {
    this.parent = parent;
  }

  public getParent(): DatasetComponent | undefined {
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

  /**
   * You can provide a method that lets the client code figure out whether a
   * Datasetcomponent can bear children.
   */
  public isComposite(): boolean {
    return false;
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
}
/**
 * Leaf node in the Dataset Composite pattern
 * Represents a single dataset without children
 */
export class DatasetLeaf<T = any> extends DatasetComponent {
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

  override isComposite(): boolean {
    return true;
  }

  override getData(): any {
    // For composite nodes, we might want to aggregate data from all children
    // or provide a different representation
    return this.children.map((child) => child.getData());
  }

  add(dataset: IDataset): void {
    this.children.push(dataset);
    if (dataset instanceof DatasetComponent) {
      dataset.setParent(this);
    }
  }

  remove(dataset: IDataset): void {
    const index = this.children.findIndex((child) => child === dataset);
    if (index !== -1) {
      this.children.splice(index, 1);
      if (dataset instanceof DatasetComponent) {
        dataset.setParent(undefined);
      }
    }
  }

  getChildren(): IDataset[] {
    return [...this.children];
  }

  /**
   * Accept a visitor
   * @param visitor The visitor to accept
   * @returns The result of the visitor's visit
   */
  override accept(visitor: IDatasetVisitor): any {
    // Check if this is a root node (no parent)
    if (!this.parent) {
      return visitor.visitRoot(this);
    } else {
      return visitor.visitComposite(this);
    }
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
  isComposite = false
): IDataset {
  if (isComposite) {
    return new DatasetComposite(name);
  } else {
    return new DatasetLeaf(name, data);
  }
}
