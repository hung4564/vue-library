import type { IDataset } from '@hungpvq/map-dataset';
import { findPartByType, findRoot, isComposite } from '@hungpvq/map-dataset';
import type { MenuAction } from '@hungpvq/map-dataset/menu';
import type { DatasetDescribe } from './types';

/** Common `IDataset.type` values — Find-part suggestions when the tree is empty. */
export const COMMON_DATASET_PART_TYPES = [
  'menu',
  'list',
  'list-item',
  'identify',
  'source',
  'layer',
  'bound',
  'highlight',
  'attribute-table',
  'geo-export',
  'data-management',
  'composite',
  'leaf',
] as const;

export type CommonDatasetPartType = (typeof COMMON_DATASET_PART_TYPES)[number];

/**
 * Types present under the dataset root, then common catalog (unique).
 * Live tree types first so Find chips match what exists.
 */
export function suggestPartTypes(from?: IDataset): string[] {
  const live = from ? listTypesInSubtree(from) : [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of [...live, ...COMMON_DATASET_PART_TYPES]) {
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function safeMethodNames(obj: object): string[] {
  const names = new Set<string>();
  let proto: object | null = obj;
  let depth = 0;
  while (proto && depth < 6) {
    for (const key of Object.getOwnPropertyNames(proto)) {
      if (key === 'constructor') continue;
      try {
        const desc = Object.getOwnPropertyDescriptor(proto, key);
        if (desc && typeof desc.value === 'function') names.add(key);
        else if (typeof (obj as Record<string, unknown>)[key] === 'function') {
          names.add(key);
        }
      } catch {
        /* ignore */
      }
    }
    proto = Object.getPrototypeOf(proto);
    depth += 1;
  }
  return [...names].sort();
}

export function describeDataset(dataset: IDataset): DatasetDescribe {
  const parent = dataset.getParent();
  return {
    id: dataset.id,
    name: dataset.getName(),
    type: dataset.type,
    dependsOn: dataset.dependsOn ? [...dataset.dependsOn] : undefined,
    parentId: parent?.id,
    childCount: isComposite(dataset) ? dataset.getChildren().length : 0,
    methodNames: safeMethodNames(dataset as object),
  };
}

export function listTypesInSubtree(from: IDataset): string[] {
  const types = new Set<string>();
  const walk = (node: IDataset) => {
    types.add(node.type);
    if (isComposite(node)) {
      for (const child of node.getChildren()) walk(child);
    }
  };
  walk(findRoot(from));
  return [...types].sort();
}

export function getMenusRaw(dataset: IDataset): MenuAction[] {
  const helper = dataset as IDataset & { getMenus?: () => MenuAction[] };
  if (typeof helper.getMenus !== 'function') return [];
  return helper.getMenus() ?? [];
}

export function getMenuPartData(dataset: IDataset): unknown {
  const part = findPartByType(dataset, 'menu') as
    | (IDataset & { getData?: () => unknown })
    | undefined;
  if (!part || typeof part.getData !== 'function') return undefined;
  return part.getData();
}
