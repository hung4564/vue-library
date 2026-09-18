import type { IDataset } from '@hungpvq/map-dataset';
import { findRoot, isComposite } from '@hungpvq/map-dataset';
import { describeDataset, listTypesInSubtree } from './describe';
import {
  buildDatasetTree,
  flattenDatasetTree,
  getParentChain,
  getPathIds,
  toDatasetSummary,
} from './tree';
import type {
  DatasetHierarchyKind,
  DatasetInspectSnapshot,
  DatasetSearchHit,
  DatasetTreeNode,
} from './types';

/**
 * Hierarchy role from map-dataset docs / structure:
 * - `root` — no parent (store entry / createRootDataset)
 * - `group` — nested composite (createGroupDataset / WithChildren)
 * - `leaf` — no children protocol (capability part or DatasetLeaf)
 */
export function getDatasetHierarchyKind(node: IDataset): DatasetHierarchyKind {
  if (!node.getParent()) return 'root';
  if (isComposite(node)) return 'group';
  return 'leaf';
}

function pathNames(node: IDataset): string[] {
  return getParentChain(node)
    .map((n) => n.name)
    .reverse();
}

function peekData(node: IDataset): unknown {
  const withData = node as IDataset & { getData?: () => unknown };
  if (typeof withData.getData !== 'function') return undefined;
  try {
    const data = withData.getData();
    if (data == null) return data;
    if (typeof data !== 'object') return data;
    // Shallow preview only — avoid dumping huge FeatureCollections into UI.
    if (Array.isArray(data)) {
      return { _preview: 'array', length: data.length };
    }
    const keys = Object.keys(data as object);
    const out: Record<string, unknown> = { _preview: 'object', keys };
    for (const key of keys.slice(0, 12)) {
      const v = (data as Record<string, unknown>)[key];
      if (v == null || typeof v !== 'object') out[key] = v;
      else if (Array.isArray(v)) out[key] = `[Array(${v.length})]`;
      else out[key] = `{${Object.keys(v as object).slice(0, 6).join(', ')}}`;
    }
    if (keys.length > 12) out['_moreKeys'] = keys.length - 12;
    return out;
  } catch {
    return undefined;
  }
}

function runtimeFlags(node: IDataset): DatasetInspectSnapshot['runtime'] {
  const n = node as IDataset & Record<string, unknown>;
  const flags: DatasetInspectSnapshot['runtime'] = {
    isComposite: isComposite(node),
    hasAddToMap: typeof n['addToMap'] === 'function',
    hasRemoveFromMap: typeof n['removeFromMap'] === 'function',
    hasGetData: typeof n['getData'] === 'function',
    hasGetMenus: typeof n['getMenus'] === 'function',
  };
  if ('show' in n && typeof n['show'] === 'boolean') flags.show = n['show'];
  if ('opacity' in n && typeof n['opacity'] === 'number') {
    flags.opacity = n['opacity'];
  }
  if ('selected' in n && typeof n['selected'] === 'boolean') {
    flags.selected = n['selected'];
  }
  return flags;
}

/** Full inspect snapshot for Dataset Devtools detail panel. */
export function inspectDataset(node: IDataset): DatasetInspectSnapshot {
  const described = describeDataset(node);
  const root = findRoot(node);
  const parent = node.getParent();
  const children = isComposite(node)
    ? node.getChildren().map(toDatasetSummary)
    : [];
  const ids = getPathIds(node);
  const names = pathNames(node);

  return {
    identity: {
      id: described.id,
      name: described.name,
      type: described.type,
      kind: getDatasetHierarchyKind(node),
      methodNames: described.methodNames,
    },
    hierarchy: {
      rootId: root.id,
      rootName: root.getName(),
      parentId: parent?.id,
      parentName: parent?.getName(),
      childCount: described.childCount,
      depth: Math.max(0, ids.length - 1),
      pathIds: ids,
      pathNames: names,
      pathLabel: names.join(' / '),
      children,
    },
    dependsOn: described.dependsOn,
    runtime: runtimeFlags(node),
    dataPreview: peekData(node),
    tree: buildDatasetTree(node),
  };
}

/** Unique `type` strings across all store roots (and their subtrees). */
export function listTypesInStoreRoots(roots: IDataset[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const root of roots) {
    for (const t of listTypesInSubtree(root)) {
      if (seen.has(t)) continue;
      seen.add(t);
      out.push(t);
    }
  }
  return out.sort();
}

/** Flatten roots for search/filter (id, name, type, path). */
export function collectSearchableDatasets(
  roots: IDataset[],
): DatasetSearchHit[] {
  const out: DatasetSearchHit[] = [];
  for (const root of roots) {
    for (const node of flattenDatasetTree(root)) {
      const chain = getParentChain(node);
      const names = chain.map((n) => n.name).reverse();
      out.push({
        ...toDatasetSummary(node),
        kind: getDatasetHierarchyKind(node),
        rootId: root.id,
        rootName: root.getName(),
        pathLabel: names.join(' / '),
      });
    }
  }
  return out;
}

export function filterSearchableDatasets(
  items: DatasetSearchHit[],
  opts: {
    query?: string;
    type?: string;
    rootId?: string;
    kind?: DatasetHierarchyKind | '';
  },
): DatasetSearchHit[] {
  const q = (opts.query ?? '').trim().toLowerCase();
  return items.filter((item) => {
    if (opts.type && item.type !== opts.type) return false;
    if (opts.rootId && item.rootId !== opts.rootId) return false;
    if (opts.kind && item.kind !== opts.kind) return false;
    if (!q) return true;
    return (
      item.id.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      item.pathLabel.toLowerCase().includes(q) ||
      item.rootName.toLowerCase().includes(q) ||
      item.kind.toLowerCase().includes(q)
    );
  });
}

export type { DatasetTreeNode };
