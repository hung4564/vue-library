import type { IDataset } from '../interfaces/dataset.base';
import type { DatasetLeaf } from '../model/dataset.base';
import { DatasetHandlerBase } from '../model/dataset.handler';

/**
 * Handler for processing leaf datasets
 * This handler only processes leaf datasets and ignores composite datasets
 */
export class LeafDatasetHandler extends DatasetHandlerBase {
  protected process(dataset: IDataset): IDataset | null {
    // Check if the dataset is a leaf dataset (doesn't have children)
    if (!('getChildren' in dataset)) {
      // Process the leaf dataset (in this example, we just return it)
      // In a real application, you might transform the data or perform other operations
      return dataset;
    }

    // If it's not a leaf dataset, return null to pass it to the next handler
    return null;
  }
}

/**
 * Handler for processing composite datasets
 * This handler only processes composite datasets and ignores leaf datasets
 */
export class CompositeDatasetHandler extends DatasetHandlerBase {
  protected process(dataset: IDataset): IDataset | null {
    // Check if the dataset is a composite dataset (has children)
    if ('getChildren' in dataset) {
      // Process the composite dataset (in this example, we just return it)
      // In a real application, you might aggregate data from children or perform other operations
      return dataset;
    }

    // If it's not a composite dataset, return null to pass it to the next handler
    return null;
  }
}

/**
 * Handler for validating datasets
 * This handler validates all datasets regardless of their type
 */
export class ValidationDatasetHandler extends DatasetHandlerBase {
  protected process(dataset: IDataset): IDataset | null {
    // Validate the dataset (in this example, we just check if it has a name)
    if (dataset.getName() && dataset.getName().trim() !== '') {
      // If the dataset is valid, return it to pass it to the next handler
      return dataset;
    }

    // If the dataset is invalid, throw an error
    throw new Error('Invalid dataset: name is required');
  }
}

/**
 * Handler for transforming datasets
 * This handler transforms all datasets regardless of their type
 */
export class TransformDatasetHandler extends DatasetHandlerBase {
  private transformFn: (dataset: IDataset) => IDataset;

  constructor(transformFn: (dataset: IDataset) => IDataset) {
    super();
    this.transformFn = transformFn;
  }

  protected process(dataset: IDataset): IDataset | null {
    // Transform the dataset using the provided function
    return this.transformFn(dataset);
  }
}

/**
 * Factory function to create a chain of dataset handlers
 * @param handlers The handlers to include in the chain
 * @returns The first handler in the chain
 */
export function createDatasetHandlerChain(
  ...handlers: DatasetHandlerBase[]
): DatasetHandlerBase {
  if (handlers.length === 0) {
    throw new Error('At least one handler is required');
  }

  // Link the handlers in the order they were provided
  for (let i = 0; i < handlers.length - 1; i++) {
    handlers[i].setNext(handlers[i + 1]);
  }

  // Return the first handler in the chain
  return handlers[0];
}
