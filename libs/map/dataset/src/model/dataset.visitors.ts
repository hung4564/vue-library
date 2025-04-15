import type { IDataset } from '../interfaces/dataset.base';
import type { IDatasetVisitor } from '../interfaces/dataset.visitor';

/**
 * Base visitor class that provides common functionality for all dataset visitors.
 * This is an abstract class that all other visitors inherit from.
 *
 * Usage:
 * To create a new visitor, extend this class and implement:
 * - visitLeaf(dataset: IDataset): any
 * - visitComposite(dataset: IDataset): any
 * - visitRoot(dataset: IDataset): any
 */
abstract class BaseDatasetVisitor implements IDatasetVisitor {
  protected visitChildren(dataset: IDataset): void {
    if (dataset.getChildren) {
      dataset.getChildren().forEach((child) => child.accept(this));
    }
  }

  abstract visitLeaf(dataset: IDataset): any;
  abstract visitComposite(dataset: IDataset): any;
  abstract visitRoot(dataset: IDataset): any;
}

/**
 * Visitor that finds the root dataset by traversing up the parent chain.
 *
 * Usage:
 * const rootFinder = new RootFinderVisitor();
 * anyDataset.accept(rootFinder);
 * const root = rootFinder.getRootDataset();
 *
 * // Reset and find root of different dataset
 * rootFinder.reset();
 */
export class RootFinderVisitor extends BaseDatasetVisitor {
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
 * Visitor that finds the first leaf with specified type from a different leaf.
 *
 * Usage:
 * const leafFinder = new TypeLeafFinderVisitor(sourceLeaf, 'targetType');
 * rootDataset.accept(leafFinder);
 * const foundLeaf = leafFinder.getFoundLeaf();
 *
 * // Reset and search for different type
 * leafFinder.reset(sourceLeaf, 'newType');
 */
export class TypeLeafFinderVisitor extends BaseDatasetVisitor {
  private sourceLeaf: IDataset | null = null;
  private typePredicate: (dataset: IDataset) => boolean;
  private foundLeaf: IDataset | null = null;

  constructor(
    sourceLeaf: IDataset,
    typePredicate: (dataset: IDataset) => boolean
  ) {
    super();
    this.sourceLeaf = sourceLeaf;
    this.typePredicate = typePredicate;
  }

  visitLeaf(dataset: IDataset): any {
    if (this.sourceLeaf && dataset === this.sourceLeaf) {
      return this.foundLeaf;
    }

    if (this.typePredicate(dataset) && !this.foundLeaf) {
      this.foundLeaf = dataset;
    }
    return this.foundLeaf;
  }

  visitComposite(dataset: IDataset): any {
    if (!this.foundLeaf) {
      this.visitChildren(dataset);
    }
    return this.foundLeaf;
  }

  visitRoot(dataset: IDataset): any {
    return this.visitComposite(dataset);
  }

  getFoundLeaf(): IDataset | null {
    return this.foundLeaf;
  }

  reset(
    sourceLeaf?: IDataset,
    typePredicate?: (dataset: IDataset) => boolean
  ): void {
    this.foundLeaf = null;
    if (sourceLeaf) {
      this.sourceLeaf = sourceLeaf;
    }
    if (typePredicate) {
      this.typePredicate = typePredicate;
    }
  }
}

/**
 * Helper function to find the first leaf with specified type from a different leaf.
 *
 * Usage:
 * const foundLeaf = findFirstLeafByType(sourceLeaf, 'targetType');
 * if (foundLeaf) {
 *   // Use the found leaf
 * }
 */
export function findFirstLeafByType(
  sourceLeaf: IDataset,
  targetType: string
): IDataset | null {
  const rootFinder = new RootFinderVisitor();
  sourceLeaf.accept(rootFinder);
  const rootDataset = rootFinder.getRootDataset();

  if (!rootDataset) {
    throw new Error('Could not find root dataset');
  }

  const visitor = new TypeLeafFinderVisitor(
    sourceLeaf,
    (dataset) => dataset.type === targetType
  );
  rootDataset.accept(visitor);

  return visitor.getFoundLeaf();
}

/**
 * Helper function to find the first leaf satisfying a predicate function.
 *
 * Usage:
 * const foundLeaf = findFirstLeaf(rootDataset, (dataset) => dataset.type === 'targetType');
 * if (foundLeaf) {
 *   // Use the found leaf
 * }
 */
export function findFirstLeaf(
  rootDataset: IDataset,
  predicate: (dataset: IDataset) => boolean
): IDataset | null {
  const visitor = new TypeLeafFinderVisitor(
    rootDataset,
    (dataset) => !dataset.isComposite() && predicate(dataset)
  );
  rootDataset.accept(visitor);
  return visitor.getFoundLeaf();
}

/**
 * Helper function to find a leaf in the same parent group or the nearest leaf satisfying a predicate function.
 * The search is done in the following order:
 * 1. First try to find in the same parent group
 * 2. If not found, search in the entire tree
 *
 * Usage:
 * const foundLeaf = findSiblingOrNearestLeaf(sourceLeaf, (dataset) => dataset.type === 'targetType');
 * if (foundLeaf) {
 *   // Use the found leaf
 * }
 */
export function findSiblingOrNearestLeaf(
  sourceLeaf: IDataset,
  predicate: (dataset: IDataset) => boolean
): IDataset | null {
  // First try to find in the same parent group
  const parent = sourceLeaf.getParent();
  if (parent && parent.isComposite() && parent.getChildren) {
    const siblings = parent.getChildren();
    if (siblings) {
      // Search in the same group first
      for (const sibling of siblings) {
        if (
          sibling !== sourceLeaf &&
          !sibling.isComposite() &&
          predicate(sibling)
        ) {
          return sibling;
        }
      }
    }
  }

  // If not found in the same group, use BFS to search the entire tree
  const rootFinder = new RootFinderVisitor();
  sourceLeaf.accept(rootFinder);
  const rootDataset = rootFinder.getRootDataset();
  if (!rootDataset) {
    return null;
  }
  return findFirstDatasetBFS(rootDataset, predicate);
}

// ===== Type Collection and Function Application Visitors =====
/**
 * This section contains visitors for collecting datasets by type and applying functions to them.
 *
 * Usage examples:
 *
 * // Collect all components of a specific type
 * const collector = new TypeFunctionVisitor((dataset) => dataset.type === 'targetType');
 * rootDataset.accept(collector);
 * const foundComponents = collector.getFoundComponents();
 *
 * // Apply functions to collected components
 * collector.addFunction((dataset) => dataset.getData());
 * collector.addFunction((dataset) => dataset.getName());
 * const results = collector.getResults();
 *
 * // Reset and reuse with different type check and functions
 * collector.reset(
 *   (dataset) => dataset.type === 'newType',
 *   [(dataset) => dataset.getData()]
 * );
 */

/**
 * Visitor that collects components by type and applies functions to them.
 *
 * Usage:
 * // Basic type collection
 * const visitor = new TypeFunctionVisitor((dataset) => dataset.type === 'targetType');
 * rootDataset.accept(visitor);
 * const components = visitor.getFoundComponents();
 *
 * // Add functions to apply
 * visitor.addFunction((dataset) => dataset.getData());
 * visitor.addFunction((dataset) => dataset.getName());
 * const results = visitor.getResults();
 * // results is a Map where key is component name and value is array of function results
 *
 * // Reset with new type check and functions
 * visitor.reset(
 *   (dataset) => dataset.type === 'newType',
 *   [(dataset) => dataset.getData()]
 * );
 */
export class TypeFunctionVisitor<
  T extends IDataset
> extends BaseDatasetVisitor {
  private typeCheckFunction: (dataset: IDataset) => dataset is T;
  private functions: ((dataset: T) => any)[] = [];
  private foundComponents: T[] = [];
  private results: Map<string, any[]> = new Map();

  constructor(
    typeCheckFunction: (dataset: IDataset) => dataset is T,
    functions: ((dataset: T) => any)[] = []
  ) {
    super();
    this.typeCheckFunction = typeCheckFunction;
    this.functions = functions;
  }

  addFunction(func: (dataset: T) => any): void {
    this.functions.push(func);
  }

  visitLeaf(dataset: IDataset): any {
    if (this.typeCheckFunction(dataset)) {
      this.foundComponents.push(dataset);
      if (this.functions.length > 0) {
        const functionResults = this.functions.map((fn) => fn(dataset));
        this.results.set(dataset.getName(), functionResults);
      }
    }
    return this.foundComponents;
  }

  visitComposite(dataset: IDataset): any {
    if (this.typeCheckFunction(dataset)) {
      this.foundComponents.push(dataset);
      if (this.functions.length > 0) {
        const functionResults = this.functions.map((fn) => fn(dataset));
        this.results.set(dataset.getName(), functionResults);
      }
    }
    this.visitChildren(dataset);
    return this.foundComponents;
  }

  visitRoot(dataset: IDataset): any {
    return this.visitComposite(dataset);
  }

  getFoundComponents(): T[] {
    return this.foundComponents;
  }

  getResults(): Map<string, any[]> {
    return this.results;
  }

  reset(
    typeCheckFunction?: (dataset: IDataset) => dataset is T,
    functions?: ((dataset: T) => any)[]
  ): void {
    this.foundComponents = [];
    this.results = new Map();
    if (typeCheckFunction) {
      this.typeCheckFunction = typeCheckFunction;
    }
    if (functions) {
      this.functions = functions;
    }
  }
}

export function runAllComponentsWithCheck<T extends IDataset>(
  rootDataset: IDataset,
  typeCheckFunction: (dataset: IDataset) => dataset is T,
  functions: ((dataset: T) => any)[] = []
): Map<string, any[]> {
  const visitor = new TypeFunctionVisitor<T>(typeCheckFunction, functions);
  rootDataset.accept(visitor);
  return visitor.getResults();
}

export function applyToAllLeaves(
  rootDataset: IDataset,
  functions: ((dataset: IDataset) => any)[] = []
): Map<string, any[]> {
  const visitor = new TypeFunctionVisitor<IDataset>(
    (dataset): dataset is IDataset => !dataset.isComposite(),
    functions
  );
  rootDataset.accept(visitor);
  return visitor.getResults();
}

// ===== Type Collection Visitors =====
/**
 * This section contains visitors for collecting datasets by type.
 *
 * Usage examples:
 *
 * // Collect all components of a specific type
 * const collector = new TypeCollectorVisitor((dataset) => dataset.type === 'targetType');
 * rootDataset.accept(collector);
 * const foundComponents = collector.getFoundComponents();
 *
 * // Or use the helper function
 * const components = findAllComponentsByType(rootDataset, 'targetType');
 *
 * // Reset and reuse with different type check
 * collector.reset((dataset) => dataset.type === 'newType');
 */

/**
 * Visitor that collects all components of a specific type.
 *
 * Usage:
 * const collector = new TypeCollectorVisitor((dataset) => dataset.type === 'targetType');
 * rootDataset.accept(collector);
 * const components = collector.getFoundComponents();
 *
 * // Reset and collect different type
 * collector.reset((dataset) => dataset.type === 'newType');
 */
export class TypeCollectorVisitor extends BaseDatasetVisitor {
  private typeCheckFunction: (dataset: IDataset) => boolean;
  private foundComponents: IDataset[] = [];

  constructor(typeCheckFunction: (dataset: IDataset) => boolean) {
    super();
    this.typeCheckFunction = typeCheckFunction;
  }

  visitLeaf(dataset: IDataset): any {
    if (this.typeCheckFunction(dataset)) {
      this.foundComponents.push(dataset);
    }
    return this.foundComponents;
  }

  visitComposite(dataset: IDataset): any {
    if (this.typeCheckFunction(dataset)) {
      this.foundComponents.push(dataset);
    }
    this.visitChildren(dataset);
    return this.foundComponents;
  }

  visitRoot(dataset: IDataset): any {
    return this.visitComposite(dataset);
  }

  getFoundComponents(): IDataset[] {
    return this.foundComponents;
  }

  reset(typeCheckFunction?: (dataset: IDataset) => boolean): void {
    this.foundComponents = [];
    if (typeCheckFunction) {
      this.typeCheckFunction = typeCheckFunction;
    }
  }
}
/**
 * Helper function to find all components of a specific type.
 *
 * Usage:
 * const components = findAllComponentsByType(rootDataset, 'targetType');
 * components.forEach(component => {
 *   console.log(component.getName());
 * });
 */
export function findAllComponentsByType(
  rootDataset: IDataset,
  targetType: string
): IDataset[] {
  const visitor = new TypeCollectorVisitor(
    (dataset) => dataset.type === targetType
  );
  rootDataset.accept(visitor);
  return visitor.getFoundComponents();
}

/**
 * Visitor that implements Breadth First Search (BFS) traversal.
 * This visitor uses a queue to process nodes level by level.
 *
 * Usage:
 * const bfsVisitor = new BFSVisitor();
 * rootDataset.accept(bfsVisitor);
 * const result = bfsVisitor.getResult();
 */
export class BFSVisitor extends BaseDatasetVisitor {
  private queue: IDataset[] = [];
  private result: IDataset[] = [];

  visitLeaf(dataset: IDataset): any {
    this.result.push(dataset);
    return this.result;
  }

  visitComposite(dataset: IDataset): any {
    this.result.push(dataset);
    if (dataset.getChildren) {
      this.queue.push(...dataset.getChildren());
    }
    return this.result;
  }

  visitRoot(dataset: IDataset): any {
    this.queue = [dataset];
    this.result = [];

    while (this.queue.length > 0) {
      const current = this.queue.shift()!;
      if (current.isComposite()) {
        this.visitComposite(current);
      } else {
        this.visitLeaf(current);
      }
    }

    return this.result;
  }

  getResult(): IDataset[] {
    return this.result;
  }
}

export class BFSWithCheckVisitor extends BaseDatasetVisitor {
  private queue: IDataset[] = [];
  private result: IDataset | null = null;
  private checkFunction: (dataset: IDataset) => boolean;

  constructor(checkFunction: (dataset: IDataset) => boolean) {
    super();
    this.checkFunction = checkFunction;
  }

  visitLeaf(dataset: IDataset): any {
    if (this.checkFunction(dataset)) {
      this.result = dataset;
      return this.result;
    }
    return null;
  }

  visitComposite(dataset: IDataset): any {
    if (this.checkFunction(dataset)) {
      this.result = dataset;
      return this.result;
    }
    if (dataset.getChildren) {
      this.queue.push(...dataset.getChildren());
    }
    return null;
  }

  visitRoot(dataset: IDataset): any {
    this.queue = [dataset];
    this.result = null;

    while (this.queue.length > 0 && !this.result) {
      const current = this.queue.shift()!;
      if (current.isComposite()) {
        this.visitComposite(current);
      } else {
        this.visitLeaf(current);
      }
    }

    return this.result;
  }

  getResult(): IDataset | null {
    return this.result;
  }
}

/**
 * Helper function to find the first dataset using BFS traversal that satisfies a check function.
 *
 * Usage:
 * const foundDataset = findFirstDatasetBFS(rootDataset, (dataset) => dataset.type === 'targetType');
 * if (foundDataset) {
 *   // Use the found dataset
 * }
 */
export function findFirstDatasetBFS(
  rootDataset: IDataset,
  checkFunction: (dataset: IDataset) => boolean
): IDataset | null {
  const visitor = new BFSWithCheckVisitor(checkFunction);
  rootDataset.accept(visitor);
  return visitor.getResult();
}
