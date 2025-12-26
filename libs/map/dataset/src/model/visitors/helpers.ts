import type { IDataset } from '../../interfaces';
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

export function findFirstLeafByType<T extends IDataset = IDataset>(
  sourceLeaf: IDataset,
  targetType: string,
): T | undefined {
  return findSiblingOrNearestLeaf<T>(
    sourceLeaf,
    (node) => node.type === targetType,
  );
}

export function findAllDatasetsMatching<T extends IDataset = IDataset>(
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

export function applyToAllLeaves<R = unknown>(
  rootDataset: IDataset,
  functions: ((dataset: IDataset) => R)[] = [],
): Map<string, R[]> {
  const results: Map<string, R[]> = new Map();
  traverseTree(rootDataset, (node) => {
    if (isComposite(node)) {
      return;
    }
    const functionResults = functions.map((fn) => fn(node));
    results.set(node.getName(), functionResults);
  });
  return results;
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

export function printTreeFromRoot(root: IDataset) {
  traverseTree(root, (node, level, path) => {
    const indent = '  '.repeat(level);
    console.info(
      `${indent}- ${path.join('.')} - ${node.type} - ${node.getName() || 'Unnamed Node'}`,
    );
  });
}

export function printTreeFromNode(leaf: IDataset) {
  const root = findRoot(leaf);
  traverseTree(root, (node, level, path) => {
    const indent = '  '.repeat(level);
    console.info(
      `${indent} - ${path.join('.')} ${node.type} - ${node.getName() || 'Unnamed Node'}`,
    );
  });
}
