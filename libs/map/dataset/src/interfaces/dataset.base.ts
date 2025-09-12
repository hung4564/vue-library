/**
 * Base interface for the Dataset Composite pattern
 * This interface defines the common operations for both leaf and composite nodes
 */
export interface IDataset {
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

  getParent(): IDataset | undefined;

  /**
   * Set the parent dataset
   * @param parent The parent dataset to set
   */
  setParent(parent?: IDataset): void;
}

export interface WithChildren {
  /**
   * Add a child dataset (only applicable for composite nodes)
   * @param dataset The dataset to add as a child
   */
  add(dataset: IDataset): void;

  /**
   * Remove a child dataset (only applicable for composite nodes)
   * @param dataset The dataset to remove
   */
  remove(dataset: IDataset): void;

  /**
   * Get all child datasets (only applicable for composite nodes)
   */
  getChildren(): IDataset[];
}
