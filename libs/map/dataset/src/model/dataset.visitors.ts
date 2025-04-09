import { IDataset } from '../interfaces/dataset.base';
import { IDatasetVisitor } from '../interfaces/dataset.visitor';

/**
 * Visitor that collects data from all datasets in the hierarchy
 */
export class DataCollectorVisitor implements IDatasetVisitor {
  private collectedData: any[] = [];

  visitLeaf(dataset: IDataset): any {
    this.collectedData.push({
      name: dataset.getName(),
      data: dataset.getData(),
      type: 'leaf',
    });
    return this.collectedData;
  }

  visitComposite(dataset: IDataset): any {
    this.collectedData.push({
      name: dataset.getName(),
      data: dataset.getData(),
      type: 'composite',
      childrenCount: dataset.getChildren?.()?.length || 0,
    });

    // Visit all children
    if (dataset.getChildren) {
      dataset.getChildren().forEach((child) => child.accept(this));
    }

    return this.collectedData;
  }

  visitRoot(dataset: IDataset): any {
    this.collectedData.push({
      name: dataset.getName(),
      data: dataset.getData(),
      type: 'root',
      childrenCount: dataset.getChildren?.()?.length || 0,
    });

    // Visit all children
    if (dataset.getChildren) {
      dataset.getChildren().forEach((child) => child.accept(this));
    }

    return this.collectedData;
  }

  getCollectedData(): any[] {
    return this.collectedData;
  }

  reset(): void {
    this.collectedData = [];
  }
}

/**
 * Visitor that finds a dataset by name
 */
export class DatasetFinderVisitor implements IDatasetVisitor {
  private targetName: string;
  private foundDataset: IDataset | null = null;

  constructor(targetName: string) {
    this.targetName = targetName;
  }

  visitLeaf(dataset: IDataset): any {
    if (dataset.getName() === this.targetName) {
      this.foundDataset = dataset;
    }
    return this.foundDataset;
  }

  visitComposite(dataset: IDataset): any {
    if (dataset.getName() === this.targetName) {
      this.foundDataset = dataset;
      return this.foundDataset;
    }

    // If not found yet, search in children
    if (dataset.getChildren && !this.foundDataset) {
      for (const child of dataset.getChildren()) {
        child.accept(this);
        if (this.foundDataset) {
          return this.foundDataset;
        }
      }
    }

    return this.foundDataset;
  }

  visitRoot(dataset: IDataset): any {
    if (dataset.getName() === this.targetName) {
      this.foundDataset = dataset;
      return this.foundDataset;
    }

    // If not found yet, search in children
    if (dataset.getChildren && !this.foundDataset) {
      for (const child of dataset.getChildren()) {
        child.accept(this);
        if (this.foundDataset) {
          return this.foundDataset;
        }
      }
    }

    return this.foundDataset;
  }

  getFoundDataset(): IDataset | null {
    return this.foundDataset;
  }

  reset(targetName?: string): void {
    this.foundDataset = null;
    if (targetName) {
      this.targetName = targetName;
    }
  }
}

/**
 * Visitor that traverses the dataset hierarchy and builds a path from root to a target dataset
 */
export class PathBuilderVisitor implements IDatasetVisitor {
  private targetName: string;
  private path: IDataset[] = [];
  private found = false;

  constructor(targetName: string) {
    this.targetName = targetName;
  }

  visitLeaf(dataset: IDataset): any {
    if (dataset.getName() === this.targetName) {
      this.path.push(dataset);
      this.found = true;
    }
    return this.path;
  }

  visitComposite(dataset: IDataset): any {
    if (dataset.getName() === this.targetName) {
      this.path.push(dataset);
      this.found = true;
      return this.path;
    }

    // If not found yet, search in children
    if (dataset.getChildren && !this.found) {
      for (const child of dataset.getChildren()) {
        child.accept(this);
        if (this.found) {
          this.path.unshift(dataset);
          return this.path;
        }
      }
    }

    return this.path;
  }

  visitRoot(dataset: IDataset): any {
    if (dataset.getName() === this.targetName) {
      this.path.push(dataset);
      this.found = true;
      return this.path;
    }

    // If not found yet, search in children
    if (dataset.getChildren && !this.found) {
      for (const child of dataset.getChildren()) {
        child.accept(this);
        if (this.found) {
          this.path.unshift(dataset);
          return this.path;
        }
      }
    }

    return this.path;
  }

  getPath(): IDataset[] {
    return this.path;
  }

  isFound(): boolean {
    return this.found;
  }

  reset(targetName?: string): void {
    this.path = [];
    this.found = false;
    if (targetName) {
      this.targetName = targetName;
    }
  }
}

/**
 * Visitor that finds the root dataset by traversing up the parent chain
 */
export class RootFinderVisitor implements IDatasetVisitor {
  private rootDataset: IDataset | null = null;

  visitLeaf(dataset: IDataset): any {
    return this.findRoot(dataset);
  }

  visitComposite(dataset: IDataset): any {
    return this.findRoot(dataset);
  }

  visitRoot(dataset: IDataset): any {
    this.rootDataset = dataset;
    return this.rootDataset;
  }

  private findRoot(dataset: IDataset): IDataset | null {
    let current: IDataset | undefined = dataset;

    while (current) {
      const parent = current.getParent();
      if (!parent) {
        this.rootDataset = current;
        break;
      }
      current = parent;
    }

    return this.rootDataset;
  }

  getRootDataset(): IDataset | null {
    return this.rootDataset;
  }

  reset(): void {
    this.rootDataset = null;
  }
}

/**
 * Visitor that applies a function to all leaf nodes in the hierarchy
 * This allows you to call one function on all leaf nodes with a single operation
 */
export class LeafFunctionVisitor implements IDatasetVisitor {
  private leafFunction: (dataset: IDataset) => any;
  private results: any[] = [];

  constructor(leafFunction: (dataset: IDataset) => any) {
    this.leafFunction = leafFunction;
  }

  visitLeaf(dataset: IDataset): any {
    // Apply the function to the leaf node and store the result
    const result = this.leafFunction(dataset);
    this.results.push(result);
    return this.results;
  }

  visitComposite(dataset: IDataset): any {
    // For composite nodes, just visit all children
    if (dataset.getChildren) {
      dataset.getChildren().forEach((child) => child.accept(this));
    }
    return this.results;
  }

  visitRoot(dataset: IDataset): any {
    // For root nodes, just visit all children
    if (dataset.getChildren) {
      dataset.getChildren().forEach((child) => child.accept(this));
    }
    return this.results;
  }

  getResults(): any[] {
    return this.results;
  }

  reset(leafFunction?: (dataset: IDataset) => any): void {
    this.results = [];
    if (leafFunction) {
      this.leafFunction = leafFunction;
    }
  }
}

/**
 * Helper function to apply a function to all leaf nodes in a dataset hierarchy
 * @param rootDataset The root dataset to start from
 * @param leafFunction The function to apply to each leaf node
 * @returns An array of results from applying the function to each leaf node
 */
export function applyToAllLeaves(
  rootDataset: IDataset,
  leafFunction: (dataset: IDataset) => any
): any[] {
  const visitor = new LeafFunctionVisitor(leafFunction);
  rootDataset.accept(visitor);
  return visitor.getResults();
}

/**
 * Visitor that runs functions from one leaf node on all other leaf nodes
 * This allows you to propagate operations from a single leaf to all other leaves
 */
export class LeafFunctionPropagatorVisitor implements IDatasetVisitor {
  private sourceLeaf: IDataset | null = null;
  private leafFunctions: ((dataset: IDataset) => any)[] = [];
  private results: Map<string, any[]> = new Map();

  constructor(sourceLeafName: string) {
    // Find the source leaf node
    const finder = new DatasetFinderVisitor(sourceLeafName);
    this.sourceLeaf = finder.getFoundDataset();
  }

  setSourceLeaf(sourceLeaf: IDataset): void {
    this.sourceLeaf = sourceLeaf;
  }

  addLeafFunction(leafFunction: (dataset: IDataset) => any): void {
    this.leafFunctions.push(leafFunction);
  }

  visitLeaf(dataset: IDataset): any {
    // Skip the source leaf node
    if (this.sourceLeaf && dataset === this.sourceLeaf) {
      return this.results;
    }

    // Apply all functions from the source leaf to this leaf
    const leafResults: any[] = [];
    for (const leafFunction of this.leafFunctions) {
      const result = leafFunction(dataset);
      leafResults.push(result);
    }

    // Store the results for this leaf
    this.results.set(dataset.getName(), leafResults);
    return this.results;
  }

  visitComposite(dataset: IDataset): any {
    // For composite nodes, just visit all children
    if (dataset.getChildren) {
      dataset.getChildren().forEach((child) => child.accept(this));
    }
    return this.results;
  }

  visitRoot(dataset: IDataset): any {
    // For root nodes, just visit all children
    if (dataset.getChildren) {
      dataset.getChildren().forEach((child) => child.accept(this));
    }
    return this.results;
  }

  getResults(): Map<string, any[]> {
    return this.results;
  }

  reset(sourceLeaf?: IDataset): void {
    this.results = new Map();
    if (sourceLeaf) {
      this.sourceLeaf = sourceLeaf;
    }
  }
}

/**
 * Helper function to run functions from one leaf node on all other leaf nodes
 * @param rootDataset The root dataset to start from
 * @param sourceLeafName The name of the source leaf node
 * @param leafFunctions The functions to apply to each leaf node
 * @returns A map of leaf names to arrays of results from applying the functions
 */
export function propagateFromLeaf(
  rootDataset: IDataset,
  sourceLeafName: string,
  leafFunctions: ((dataset: IDataset) => any)[]
): Map<string, any[]> {
  const visitor = new LeafFunctionPropagatorVisitor(sourceLeafName);

  // Add all functions to the visitor
  for (const leafFunction of leafFunctions) {
    visitor.addLeafFunction(leafFunction);
  }

  // Accept the visitor on the root dataset
  rootDataset.accept(visitor);

  return visitor.getResults();
}

/**
 * Visitor that runs functions from one leaf node on all other leaf nodes without needing to know the root
 * This allows you to propagate operations from a single leaf to all other leaves when you only have access to the leaf
 */
export class LeafToLeafFunctionVisitor implements IDatasetVisitor {
  private sourceLeaf: IDataset;
  private leafFunctions: ((dataset: IDataset) => any)[] = [];
  private results: Map<string, any[]> = new Map();
  private visitedLeaves: Set<IDataset> = new Set();

  constructor(sourceLeaf: IDataset) {
    this.sourceLeaf = sourceLeaf;
  }

  addLeafFunction(leafFunction: (dataset: IDataset) => any): void {
    this.leafFunctions.push(leafFunction);
  }

  visitLeaf(dataset: IDataset): any {
    // Skip the source leaf node and already visited leaves
    if (dataset === this.sourceLeaf || this.visitedLeaves.has(dataset)) {
      return this.results;
    }

    // Mark this leaf as visited
    this.visitedLeaves.add(dataset);

    // Apply all functions from the source leaf to this leaf
    const leafResults: any[] = [];
    for (const leafFunction of this.leafFunctions) {
      const result = leafFunction(dataset);
      leafResults.push(result);
    }

    // Store the results for this leaf
    this.results.set(dataset.getName(), leafResults);
    return this.results;
  }

  visitComposite(dataset: IDataset): any {
    // For composite nodes, just visit all children
    if (dataset.getChildren) {
      dataset.getChildren().forEach((child) => child.accept(this));
    }
    return this.results;
  }

  visitRoot(dataset: IDataset): any {
    // For root nodes, just visit all children
    if (dataset.getChildren) {
      dataset.getChildren().forEach((child) => child.accept(this));
    }
    return this.results;
  }

  getResults(): Map<string, any[]> {
    return this.results;
  }

  reset(sourceLeaf?: IDataset): void {
    this.results = new Map();
    this.visitedLeaves = new Set();
    if (sourceLeaf) {
      this.sourceLeaf = sourceLeaf;
    }
  }
}

/**
 * Helper function to run functions from one leaf node on all other leaf nodes without needing to know the root
 * @param sourceLeaf The source leaf node to start from
 * @param leafFunctions The functions to apply to each leaf node
 * @returns A map of leaf names to arrays of results from applying the functions
 */
export function runFromLeaf(
  sourceLeaf: IDataset,
  leafFunctions: ((dataset: IDataset) => any)[]
): Map<string, any[]> {
  // Find the root node by traversing up the parent chain
  const rootFinder = new RootFinderVisitor();
  sourceLeaf.accept(rootFinder);
  const rootDataset = rootFinder.getRootDataset();

  if (!rootDataset) {
    throw new Error('Could not find root dataset');
  }

  // Create a visitor to run functions on all other leaves
  const visitor = new LeafToLeafFunctionVisitor(sourceLeaf);

  // Add all functions to the visitor
  for (const leafFunction of leafFunctions) {
    visitor.addLeafFunction(leafFunction);
  }

  // Accept the visitor on the root dataset
  rootDataset.accept(visitor);

  return visitor.getResults();
}
