import type { IDataset } from '../../interfaces';
import { isComposite } from '../../utils/check';
import { traverseTree } from './traverse';

export function findRoot(node: IDataset): IDataset {
  let current = node;
  let parent = current.getParent?.();

  while (parent) {
    current = parent;
    parent = current.getParent?.();
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

      const children =
        'getChildren' in current &&
        typeof (current as any).getChildren === 'function'
          ? (current as any).getChildren()
          : [];

      if (children.length === 0 && check(current)) {
        foundNode = current;
        return false;
      }
    },
    {
      strategy: 'bfs',
      direction: 'ltr',
      check: () => foundNode !== null, // khi đã tìm thấy => dừng toàn bộ
    },
  );

  return foundNode;
}
export function findSiblingOrNearestLeaf(
  startNode: IDataset,
  check: (node: IDataset) => boolean,
): IDataset | undefined {
  let current: IDataset | undefined = startNode;
  let excludeNode: IDataset | null = null;

  while (current) {
    const found = findLeafInSubtreeBFS(current, check, excludeNode);
    if (found) return found;

    excludeNode = current;
    current = current.getParent?.();
  }

  return undefined;
}

export function findFirstLeafByType(
  sourceLeaf: IDataset,
  targetType: string,
): IDataset | undefined {
  return findSiblingOrNearestLeaf(
    sourceLeaf,
    (node) => node.type === targetType,
  );
}
export function findAllDatasetsMatching(
  startNode: IDataset,
  check: (node: IDataset) => boolean,
  excludeNode?: IDataset | null,
): IDataset[] {
  const result: IDataset[] = [];

  traverseTree(
    startNode,
    (node) => {
      if (node === excludeNode) return;
      if (check(node)) result.push(node);
    },
    {
      strategy: 'bfs',
      direction: 'ltr',
      check: (node) => node === excludeNode,
    },
  );

  return result;
}

export function findAllComponentsByType(
  rootDataset: IDataset,
  targetType: string,
): IDataset[] {
  return findAllDatasetsMatching(
    rootDataset,
    (node) => node.type === targetType,
  );
}

export function applyToAllLeaves(
  rootDataset: IDataset,
  functions: ((dataset: IDataset) => any)[] = [],
): Map<string, any[]> {
  const results: Map<string, any[]> = new Map();
  traverseTree(rootDataset, (node) => {
    if (isComposite(node)) {
      return;
    }
    const functionResults = functions.map((fn) => fn(node));
    results.set(node.getName(), functionResults);
  });
  return results;
}

export function runAllComponentsWithCheck<T extends IDataset = IDataset>(
  rootDataset: IDataset,
  typeCheckFunction: (dataset: IDataset) => dataset is T,
  functions: ((dataset: T) => any)[] = [],
): Map<string, any[]> {
  const results: Map<string, any[]> = new Map();
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
