import type { IDataset } from './dataset.base';

/**
 * Interface for visitors in the Visitor pattern
 * Each visitor can visit different types of dataset nodes
 */
export interface IDatasetVisitor {
  /**
   * Visit a leaf dataset
   * @param dataset The leaf dataset to visit
   * @returns The result of visiting the leaf dataset
   */
  visitLeaf(dataset: IDataset): any;

  /**
   * Visit a composite dataset
   * @param dataset The composite dataset to visit
   * @returns The result of visiting the composite dataset
   */
  visitComposite(dataset: IDataset): any;

  /**
   * Visit a root dataset (top-level dataset)
   * @param dataset The root dataset to visit
   * @returns The result of visiting the root dataset
   */
  visitRoot(dataset: IDataset): any;
}
