export type DeletePolicy =
  | 'self'
  | 'children'
  | 'subtree'
  | 'root-on-empty'
  | 'cascade'
  | 'root';

/**
 * Base interface for the Dataset Composite pattern
 * This interface defines the common operations for both leaf and composite nodes
 */
export interface IDataset {
  get type(): string;
  get id(): string;
  /**
   * Policy to apply when this component or its items are deleted:
   * - 'self': chỉ xóa bản thân component đó (không xóa con, không xóa root).
   * - 'children' (hoặc 'subtree'): xóa component này thì xóa cả các con nữa (nhưng không xóa root).
   * - 'root-on-empty': nếu toàn bộ các dataset cùng loại trong root đó bị xóa thì xóa cả root (mặc định của list/list-item).
   * - 'cascade' (hoặc 'root'): xóa dataset này thì xóa toàn bộ root và tất cả con (mặc định của root).
   */
  get deletePolicy(): DeletePolicy;
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

  /**
   * Optional array of dataset IDs this dataset depends on
   * Used to ensure dependency-aware add/remove order
   */
  dependsOn?: string[];

  /**
   * Add a dependency if not already present. Accepts a string id or an IDataset.
   */
  addDependsOn(input: string | IDataset): void;
  /**
   * Remove a dependency if present. Accepts a string id or an IDataset.
   */
  removeDependsOn(input: string | IDataset): void;
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
