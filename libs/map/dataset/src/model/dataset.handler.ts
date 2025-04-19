import type { IDataset } from '../interfaces/dataset.base';
import type { IDatasetHandler } from '../interfaces/dataset.handler';

/**
 * Abstract base class for dataset handlers in the Chain of Responsibility pattern
 * Implements common functionality for all handlers
 */
export abstract class DatasetHandlerBase implements IDatasetHandler {
  private nextHandler: IDatasetHandler | null = null;

  /**
   * Set the next handler in the chain
   * @param handler The next handler
   * @returns The next handler for method chaining
   */
  setNext(handler: IDatasetHandler): IDatasetHandler {
    this.nextHandler = handler;
    return handler;
  }

  /**
   * Process the dataset and pass it to the next handler if needed
   * @param dataset The dataset to process
   * @returns The processed dataset or null if no handler can process it
   */
  handle(dataset: IDataset): IDataset | null {
    // Try to process the dataset with this handler
    const result = this.process(dataset);

    // If this handler processed the dataset, return the result
    if (result !== null) {
      return result;
    }

    // If this handler couldn't process the dataset and there's a next handler,
    // pass the dataset to the next handler
    if (this.nextHandler) {
      return this.nextHandler.handle(dataset);
    }

    // If no handler could process the dataset, return null
    return null;
  }

  /**
   * Abstract method to be implemented by concrete handlers
   * @param dataset The dataset to process
   * @returns The processed dataset or null if the handler cannot process it
   */
  protected abstract process(dataset: IDataset): IDataset | null;
}
