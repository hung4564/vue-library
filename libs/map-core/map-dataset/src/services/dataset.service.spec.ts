import { describe, expect, it, vi } from 'vitest';
import type { MapSimple } from '@hungpvq/map-core';
import type { IDataset } from '../interfaces';
import { DatasetService, type DatasetStoreLike } from './dataset.service';

function createStore(): DatasetStoreLike {
  return {
    datasets: {},
    datasetIds: { value: [] },
  };
}

function createLeafDataset(
  id: string,
  options: {
    dependsOn?: string[];
    order?: string[];
  } = {},
): IDataset & {
  addToMap: (map: MapSimple) => void;
  removeFromMap: (map: MapSimple) => void;
} {
  const order = options.order ?? [];
  return {
    id,
    type: 'leaf',
    dependsOn: options.dependsOn,
    getName: () => id,
    setName: () => undefined,
    getParent: () => undefined,
    setParent: () => undefined,
    addDependsOn: () => undefined,
    removeDependsOn: () => undefined,
    addToMap: vi.fn(() => {
      order.push(`add:${id}`);
    }),
    removeFromMap: vi.fn(() => {
      order.push(`remove:${id}`);
    }),
  };
}

describe('DatasetService', () => {
  const map = {} as MapSimple;

  it('registers dataset id and calls addToMap', async () => {
    const store = createStore();
    const order: string[] = [];
    const layer = createLeafDataset('layer-a', { order });

    await DatasetService.addDataset(store, map, layer);

    expect(store.datasets['layer-a']).toBe(layer);
    expect(store.datasetIds.value).toEqual(['layer-a']);
    expect(order).toEqual(['add:layer-a']);
  });

  it('adds dependencies before the dataset itself', async () => {
    const store = createStore();
    const order: string[] = [];
    const dep = createLeafDataset('dep-a', { order });
    store.datasets[dep.id] = dep;

    const layer = createLeafDataset('layer-b', {
      dependsOn: ['dep-a'],
      order,
    });

    await DatasetService.addDataset(store, map, layer);

    expect(order).toEqual(['add:dep-a', 'add:layer-b']);
  });

  it('removes dataset then dependencies (rtl)', async () => {
    const store = createStore();
    const order: string[] = [];
    const dep = createLeafDataset('dep-a', { order });
    store.datasets[dep.id] = dep;

    const layer = createLeafDataset('layer-b', {
      dependsOn: ['dep-a'],
      order,
    });
    store.datasets[layer.id] = layer;
    store.datasetIds.value = [dep.id, layer.id];

    await DatasetService.removeDataset(store, map, layer);

    expect(store.datasets[layer.id]).toBeUndefined();
    expect(store.datasetIds.value).toEqual([dep.id]);
    expect(order).toEqual(['remove:layer-b', 'remove:dep-a']);
  });

  it('skips missing dependencies when adding', async () => {
    const store = createStore();
    const order: string[] = [];
    const layer = createLeafDataset('layer-c', {
      dependsOn: ['missing-dep'],
      order,
    });

    await DatasetService.addDataset(store, map, layer);

    expect(order).toEqual(['add:layer-c']);
    expect(store.datasetIds.value).toEqual(['layer-c']);
  });

  it('getAllComponentsByType collects matching nodes across datasets', async () => {
    const store = createStore();
    const listA = createLeafDataset('list-a');
    (listA as { type: string }).type = 'list';
    const listB = createLeafDataset('list-b');
    (listB as { type: string }).type = 'list';
    const other = createLeafDataset('other');

    await DatasetService.addDataset(store, map, listA);
    await DatasetService.addDataset(store, map, listB);
    await DatasetService.addDataset(store, map, other);

    const lists = DatasetService.getAllComponentsByType(store, 'list');
    expect(lists.map((item) => item.id).sort()).toEqual(['list-a', 'list-b']);
  });

  it('removeComponent calls removeFromMap on the component', () => {
    const order: string[] = [];
    const layer = createLeafDataset('layer-d', { order });

    DatasetService.removeComponent(map, layer);

    // Direct remove + applyToAllLeaves on parent (same leaf when no parent)
    expect(order).toEqual(['remove:layer-d', 'remove:layer-d']);
  });

  it('assigns list indexes after existing lists', async () => {
    const store = createStore();
    const first = createLeafDataset('list-1') as IDataset & {
      type: string;
      index?: number;
    };
    first.type = 'list';
    const second = createLeafDataset('list-2') as IDataset & {
      type: string;
      index?: number;
    };
    second.type = 'list';

    await DatasetService.addDataset(store, map, first);
    await DatasetService.addDataset(store, map, second);

    expect(first.index).toBe(1);
    expect(second.index).toBe(2);
  });
});
