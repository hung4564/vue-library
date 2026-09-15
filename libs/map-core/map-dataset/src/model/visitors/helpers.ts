import type { IDataset } from '../../interfaces/dataset.base';
import { isComposite } from '../../utils/check';
import { traverseTree } from './traverse';

export function findRoot(node: IDataset): IDataset {
  let current = node;
  let parent = current.getParent();

  while (parent) {
    current = parent;
    parent = current.getParent();
  }
  return current;
}

function findLeafInSubtreeBFS(
  node: IDataset,
  check: (node: IDataset) => boolean,
  excludeNode?: IDataset | null,
): IDataset | null {
  if (node === excludeNode) return null;

  let foundNode: IDataset | null = null;

  traverseTree(
    node,
    (current) => {
      if (current === excludeNode) return;

      const children = isComposite(current) ? current.getChildren() : [];

      if (children.length === 0 && check(current)) {
        foundNode = current;
        return false;
      }
      return;
    },
    {
      strategy: 'bfs',
      direction: 'ltr',
      check: () => foundNode !== null,
    },
  );

  return foundNode;
}

export function findSiblingOrNearestLeaf<T extends IDataset = IDataset>(
  startNode: IDataset,
  check: (node: IDataset) => boolean,
): T | undefined {
  let current: IDataset | undefined = startNode;
  let excludeNode: IDataset | null = null;

  while (current) {
    const found = findLeafInSubtreeBFS(current, check, excludeNode);
    if (found) return found as T;

    excludeNode = current;
    current = current.getParent();
  }

  return undefined;
}

export function findPartByType<T extends IDataset = IDataset>(
  node: IDataset | undefined,
  targetType: string,
  guard?: (part: IDataset) => part is T,
): T | undefined {
  if (!node) return undefined;
  const found = findSiblingOrNearestLeaf(
    node,
    (part) => part.type === targetType,
  );
  if (!found) return undefined;
  if (guard && !guard(found)) return undefined;
  return found as T;
}

function findAllDatasetsMatching<T extends IDataset = IDataset>(
  startNode: IDataset,
  check: (node: IDataset) => boolean,
  excludeNode?: IDataset | null,
): T[] {
  const result: T[] = [];

  traverseTree(
    startNode,
    (node) => {
      if (node === excludeNode) return;
      if (check(node)) result.push(node as T);
    },
    {
      strategy: 'bfs',
      direction: 'ltr',
      check: (node) => node === excludeNode,
    },
  );

  return result;
}

export function findAllComponentsByType<T extends IDataset = IDataset>(
  rootDataset: IDataset,
  targetType: string,
): T[] {
  return findAllDatasetsMatching<T>(
    rootDataset,
    (node) => node.type === targetType,
  );
}

export function runAllComponentsWithCheck<
  T extends IDataset = IDataset,
  R = unknown,
>(
  rootDataset: IDataset,
  typeCheckFunction: (dataset: IDataset) => dataset is T,
  functions: ((dataset: T) => R)[] = [],
): Map<string, R[]> {
  const results: Map<string, R[]> = new Map();
  traverseTree(rootDataset, (node) => {
    if (!typeCheckFunction(node)) {
      return;
    }
    const functionResults = functions.map((fn) => fn(node));
    results.set(node.getName(), functionResults);
  });
  return results;
}
