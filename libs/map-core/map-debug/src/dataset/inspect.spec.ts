import {
  createDataset,
  createGroupDataset,
  createRootDataset,
} from '@hungpvq/map-dataset';
import { describe, expect, it } from 'vitest';

import {
  collectSearchableDatasets,
  filterSearchableDatasets,
  getDatasetHierarchyKind,
  inspectDataset,
  listTypesInStoreRoots,
} from './inspect';

describe('dataset inspect helpers', () => {
  it('classifies root / group / leaf from hierarchy', () => {
    const root = createRootDataset('Root');
    const group = createGroupDataset('Nested group');
    root.add(group);
    const leaf = createDataset('Leaf part');
    Object.defineProperty(leaf, 'type', {
      configurable: true,
      get: () => 'list',
    });
    group.add(leaf);

    expect(getDatasetHierarchyKind(root)).toBe('root');
    expect(getDatasetHierarchyKind(group)).toBe('group');
    expect(getDatasetHierarchyKind(leaf)).toBe('leaf');
  });

  it('inspectDataset exposes identity, hierarchy path, and runtime flags', () => {
    const root = createRootDataset('World');
    const leaf = createDataset('Cities');
    Object.defineProperty(leaf, 'type', {
      configurable: true,
      get: () => 'list',
    });
    Object.assign(leaf, {
      getData: () => ({ features: [1, 2, 3], meta: { a: 1 } }),
      show: true,
    });
    root.add(leaf);

    const snap = inspectDataset(leaf);
    expect(snap.identity.kind).toBe('leaf');
    expect(snap.identity.type).toBe('list');
    expect(snap.hierarchy.rootId).toBe(root.id);
    expect(snap.hierarchy.parentId).toBe(root.id);
    expect(snap.hierarchy.pathLabel).toContain('World');
    expect(snap.hierarchy.pathLabel).toContain('Cities');
    expect(snap.hierarchy.depth).toBe(1);
    expect(snap.runtime.hasGetData).toBe(true);
    expect(snap.runtime.show).toBe(true);
    expect(snap.dataPreview).toMatchObject({
      _preview: 'object',
      features: '[Array(3)]',
    });
  });

  it('collects searchable nodes and filters by type / root / kind / query', () => {
    const rootA = createRootDataset('A');
    const rootB = createRootDataset('B');
    const leaf = createDataset('Part');
    Object.defineProperty(leaf, 'type', {
      configurable: true,
      get: () => 'identify',
    });
    rootA.add(leaf);

    const all = collectSearchableDatasets([rootA, rootB]);
    expect(all.map((x) => x.id)).toEqual(
      expect.arrayContaining([rootA.id, rootB.id, leaf.id]),
    );

    expect(listTypesInStoreRoots([rootA, rootB])).toEqual(
      expect.arrayContaining(['composite', 'identify']),
    );

    const byType = filterSearchableDatasets(all, { type: 'identify' });
    expect(byType).toHaveLength(1);
    expect(byType[0]?.id).toBe(leaf.id);

    const byRoot = filterSearchableDatasets(all, { rootId: rootB.id });
    expect(byRoot.every((x) => x.rootId === rootB.id)).toBe(true);

    const byKind = filterSearchableDatasets(all, { kind: 'leaf' });
    expect(byKind.every((x) => x.kind === 'leaf')).toBe(true);

    const byQuery = filterSearchableDatasets(all, { query: 'ident' });
    expect(byQuery.some((x) => x.id === leaf.id)).toBe(true);
  });
});
