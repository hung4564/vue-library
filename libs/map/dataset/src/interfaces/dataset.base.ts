import { IDatasetVisitor } from './dataset.visitor';

/**
 * Base interface for the Dataset Composite pattern
 * This interface defines the common operations for both leaf and composite nodes
 */
export interface IDataset extends IDatasetVisit {
  get type(): string;
  get id(): string;
  /**
   * Get the name of the dataset
   */
  getName(): string;
  /**
   * Set the name of the dataset
   */
  setName(name: string): void;

  /**
   * Get the data of the dataset
   */
  getData(): any;
  /**
   * Get the data of the dataset
   */
  setData(data: any): void;

  /**
   * Add a child dataset (only applicable for composite nodes)
   * @param dataset The dataset to add as a child
   */
  add?(dataset: IDataset): void;

  /**
   * Remove a child dataset (only applicable for composite nodes)
   * @param dataset The dataset to remove
   */
  remove?(dataset: IDataset): void;

  /**
   * Get all child datasets (only applicable for composite nodes)
   */
  getChildren?(): IDataset[];
}

export interface IDatasetVisit {
  /**
   * Get the parent dataset
   * @returns The parent dataset or undefined if this is a root dataset
   */
  getParent(): IDataset | undefined;

  /**
   * Set the parent dataset
   * @param parent The parent dataset to set
   */
  setParent(parent?: IDataset): void;

  /**
   * Check if this dataset is a composite (has children)
   * @returns True if this dataset is a composite, false otherwise
   */
  isComposite(): boolean;

  /**
   * Accept a visitor
   * @param visitor The visitor to accept
   * @returns The result of the visitor's visit
   */
  accept(visitor: IDatasetVisitor): any;
}
