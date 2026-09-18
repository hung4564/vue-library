import type { IDataset } from '@hungpvq/map-dataset';
import {
  findAllComponentsByType,
  findPartByType,
  findRoot,
  isComposite,
} from '@hungpvq/map-dataset';
import type { ExplainStep } from './types';
import { toDatasetSummary } from './tree';

export function debugFindPartByType(
  from: IDataset,
  type: string,
): IDataset | undefined {
  return findPartByType(from, type);
}

export function debugFindAllByType(from: IDataset, type: string): IDataset[] {
  return findAllComponentsByType(findRoot(from), type);
}

/**
 * Step-by-step explanation mirroring `findPartByType` /
 * `findSiblingOrNearestLeaf` (BFS leaf match, then walk parents).
 */
export function explainFindPart(from: IDataset, type: string): ExplainStep[] {
  const steps: ExplainStep[] = [];
  let step = 0;
  const push = (message: string, detail?: Record<string, unknown>) => {
    step += 1;
    steps.push({ step, message, detail });
  };

  push('Start findPartByType', {
    from: toDatasetSummary(from),
    targetType: type,
  });

  let current: IDataset | undefined = from;
  let excludeNode: IDataset | null = null;
  let found: IDataset | undefined;

  while (current) {
    push('Search subtree for leaf with matching type (BFS)', {
      at: toDatasetSummary(current),
      excludeId: excludeNode?.id,
    });

    const queue: IDataset[] = [];
    if (current !== excludeNode) queue.push(current);
    const visited = new Set<string>();
    let leafMatch: IDataset | undefined;

    while (queue.length > 0) {
      const next = queue.shift();
      if (!next) continue;
      const node = next;
      if (visited.has(node.id)) continue;
      visited.add(node.id);
      if (node === excludeNode) continue;

      const kids = isComposite(node) ? node.getChildren() : [];
      if (kids.length === 0) {
        if (node.type === type) {
          leafMatch = node;
          break;
        }
      } else {
        for (const child of kids) {
          if (child !== excludeNode) queue.push(child);
        }
      }
    }

    if (leafMatch) {
      found = leafMatch;
      push('Matched leaf part', { part: toDatasetSummary(leafMatch) });
      break;
    }

    push('No match in subtree; walk to parent', {
      parentId: current.getParent()?.id,
    });
    excludeNode = current;
    current = current.getParent();
  }

  if (!found) {
    push('Not found', { targetType: type });
  } else {
    push('Result', { part: toDatasetSummary(found) });
  }

  return steps;
}
