import type { IDataset } from '@hungpvq/map-dataset';
import { isComposite } from '@hungpvq/map-dataset';
import { findRoot } from '@hungpvq/map-dataset';
import type { DatasetNodeSummary, DatasetTreeNode } from './types';

function summary(node: IDataset): DatasetNodeSummary {
  return {
    id: node.id,
    name: node.getName(),
    type: node.type,
  };
}

export function buildDatasetTree(node: IDataset): DatasetTreeNode {
  const children = isComposite(node)
    ? node.getChildren().map((c) => buildDatasetTree(c))
    : [];
  return { ...summary(node), children };
}

export function getParentChain(node: IDataset): DatasetNodeSummary[] {
  const chain: DatasetNodeSummary[] = [];
  let current: IDataset | undefined = node;
  while (current) {
    chain.push(summary(current));
    current = current.getParent();
  }
  return chain;
}

export function getRootDataset(node: IDataset): IDataset {
  return findRoot(node);
}

export function getDatasetChildren(node: IDataset): IDataset[] {
  return isComposite(node) ? [...node.getChildren()] : [];
}

export function getPathIds(node: IDataset): string[] {
  return getParentChain(node)
    .map((n) => n.id)
    .reverse();
}

/** Depth-first lookup by `id` under a root (or any subtree). */
export function findDatasetById(
  root: IDataset,
  id: string,
): IDataset | undefined {
  if (root.id === id) return root;
  if (!isComposite(root)) return undefined;
  for (const child of root.getChildren()) {
    const found = findDatasetById(child, id);
    if (found) return found;
  }
  return undefined;
}

/** Flatten root + all descendants (depth-first). */
export function flattenDatasetTree(root: IDataset): IDataset[] {
  const out: IDataset[] = [root];
  if (!isComposite(root)) return out;
  for (const child of root.getChildren()) {
    out.push(...flattenDatasetTree(child));
  }
  return out;
}

export { summary as toDatasetSummary };
