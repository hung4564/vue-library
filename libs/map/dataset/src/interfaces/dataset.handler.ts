import type { IDataset } from './dataset.base';

/**
 * Interface for handlers in the Chain of Responsibility pattern
 * Each handler can process a dataset or pass it to the next handler
 */
export interface IDatasetHandler {
  /**
   * Set the next handler in the chain
   * @param handler The next handler
   * @returns The next handler for method chaining
   */
  setNext(handler: IDatasetHandler): IDatasetHandler;

  /**
   * Process the dataset
   * @param dataset The dataset to process
   * @returns The processed dataset or null if the handler cannot process it
   */
  handle(dataset: IDataset): IDataset | null;
}
