import { describe, expect, it, vi } from 'vitest';
import type { MapSimple } from '@hungpvq/map-core';
import {
  createRootDataset,
  createDatasetComponent,
  addDatasetWithChildren,
  createDatasetPartListViewUiComponentBuilder,
} from '@hungpvq/map-dataset';
import { useMapDataset } from './dataset-api';
import { addStore } from '@hungpvq/vue-map-core';

describe('useMapDataset - deletePolicy behaviors', () => {
  let mapId: string;
  let mockMap: MapSimple;
  let counter = 0;

  beforeEach(() => {
    counter++;
    mapId = `test-map-policy-${counter}`;
    mockMap = { id: mapId } as MapSimple;
    addStore(mapId, 'map', mockMap);
  });

  it('policy "self": only deletes itself, leaves children and preserves root', async () => {
    const api = useMapDataset(mapId);
    const root = createRootDataset('Root');
    root.deletePolicy = 'self';

    const child = addDatasetWithChildren(createDatasetComponent('Child 1'));
    child.deletePolicy = 'self';
    (child as any).removeFromMap = vi.fn();

    const subChild = createDatasetComponent('Sub Child 1');
    (subChild as any).removeFromMap = vi.fn();

    child.add(subChild);
    root.add(child);

    await api.addDataset(root);
    expect(api.getDatasets().length).toBe(1);

    api.removeComponent(child);
    await new Promise((r) => setTimeout(r, 10));

    expect((child as any).removeFromMap).toHaveBeenCalled();
    expect((subChild as any).removeFromMap).not.toHaveBeenCalled(); // children NOT removed
    expect(api.getDatasets().length).toBe(1); // root preserved
  });

  it('policy "children": deletes itself and its children, but preserves root', async () => {
    const api = useMapDataset(mapId);
    const root = createRootDataset('Root');
    root.deletePolicy = 'self';

    const group = addDatasetWithChildren(createDatasetComponent('Group 1'));
    group.deletePolicy = 'children';
    (group as any).removeFromMap = vi.fn();

    const leaf = createDatasetComponent('Leaf 1');
    (leaf as any).removeFromMap = vi.fn();

    group.add(leaf);
    root.add(group);

    await api.addDataset(root);
    expect(api.getDatasets().length).toBe(1);

    api.removeComponent(group);
    await new Promise((r) => setTimeout(r, 10));

    expect((leaf as any).removeFromMap).toHaveBeenCalled(); // children removed
    expect((root as any).getChildren()).not.toContain(group); // group detached from root
    expect(api.getDatasets().length).toBe(1); // root preserved
  });

  it('policy "root-on-empty": deletes root ONLY when all datasets with root-on-empty are gone (A,B,C,D scenario)', async () => {
    const api = useMapDataset(mapId);
    const root = createRootDataset('Root A B C D');

    // A and C have deletePolicy = 'root-on-empty'
    const compA = createDatasetPartListViewUiComponentBuilder('A').build();
    const compC = createDatasetPartListViewUiComponentBuilder('C').build();
    expect(compA.deletePolicy).toBe('root-on-empty');
    expect(compC.deletePolicy).toBe('root-on-empty');

    // B and D have default child deletePolicy = 'self'
    const compB = createDatasetComponent('B');
    const compD = createDatasetComponent('D');

    root.add(compA);
    root.add(compB);
    root.add(compC);
    root.add(compD);

    expect(compB.deletePolicy).toBe('self');
    expect(compD.deletePolicy).toBe('self');

    await api.addDataset(root);
    expect(api.getDatasets().length).toBe(1);

    // Remove A: C still remains with 'root-on-empty' -> root must NOT be deleted
    api.removeComponent(compA);
    await new Promise((r) => setTimeout(r, 10));
    expect(api.getDatasets().length).toBe(1);

    // Remove C: no more 'root-on-empty' components remain in root -> root MUST be deleted!
    api.removeComponent(compC);
    await new Promise((r) => setTimeout(r, 10));
    expect(api.getDatasets().length).toBe(0);
  });

  it('policy "cascade": deletes the entire root immediately', async () => {
    const api = useMapDataset(mapId);
    const root = createRootDataset('Cascade Root');

    const item1 = createDatasetPartListViewUiComponentBuilder('Item 1').build();
    const item2 = createDatasetPartListViewUiComponentBuilder('Item 2').build();

    item1.deletePolicy = 'cascade';

    root.add(item1);
    root.add(item2);

    await api.addDataset(root);
    expect(api.getDatasets().length).toBe(1);

    // Removing item1 (which has deletePolicy = 'cascade') immediately deletes the whole root
    api.removeComponent(item1);
    await new Promise((r) => setTimeout(r, 10));
    expect(api.getDatasets().length).toBe(0);
  });

  it('scoped cleanup with deleteGroup: only deletes root when all components of that specific group are gone', async () => {
    const api = useMapDataset(mapId);
    const root = createRootDataset('Grouped Dataset');

    // Group "groupA": itemA1, itemA2
    const itemA1 = createDatasetPartListViewUiComponentBuilder('A1')
      .configDeleteGroup('groupA')
      .build();
    const itemA2 = createDatasetPartListViewUiComponentBuilder('A2')
      .configDeleteGroup('groupA')
      .build();

    // Group "groupB": itemB1
    const itemB1 = createDatasetPartListViewUiComponentBuilder('B1')
      .configDeleteGroup('groupB')
      .build();

    root.add(itemA1);
    root.add(itemA2);
    root.add(itemB1);

    await api.addDataset(root);
    expect(api.getDatasets().length).toBe(1);

    // Remove itemA1: itemA2 in groupA still remains -> root NOT deleted
    api.removeComponent(itemA1);
    await new Promise((r) => setTimeout(r, 10));
    expect(api.getDatasets().length).toBe(1);

    // Remove itemA2: last in groupA -> root is deleted!
    api.removeComponent(itemA2);
    await new Promise((r) => setTimeout(r, 10));
    expect(api.getDatasets().length).toBe(0);
  });
});
