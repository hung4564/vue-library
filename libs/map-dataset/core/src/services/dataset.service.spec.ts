import type { MapSimple } from '@hungpvq/map-core';
import { describe, expect, it, vi } from 'vitest';

import type { IDataset } from '../interfaces/dataset.base';
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
    get deletePolicy() {
      return 'self';
    },
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

    expect(order).toEqual(['remove:layer-d']);
  });

  it('removeComponent removes layers before sources (rtl under parent)', () => {
    const order: string[] = [];
    const children: ReturnType<typeof createLeafDataset>[] = [];
    const parent = {
      id: 'root',
      type: 'composite',
      getName: () => 'root',
      setName: () => undefined,
      getParent: () => undefined,
      setParent: () => undefined,
      addDependsOn: () => undefined,
      removeDependsOn: () => undefined,
      getChildren: () => children,
      add: () => undefined,
      remove: vi.fn(),
    } as unknown as IDataset & {
      getChildren: () => IDataset[];
      remove: ReturnType<typeof vi.fn>;
    };

    const source = createLeafDataset('source', { order });
    const layer = createLeafDataset('layer', { order });
    const list = createLeafDataset('list', { order });
    // list has no map hooks — strip them so only source/layer remove
    delete (list as { addToMap?: unknown }).addToMap;
    delete (list as { removeFromMap?: unknown }).removeFromMap;
    source.getParent = () => parent;
    layer.getParent = () => parent;
    list.getParent = () => parent;
    children.push(source, layer, list);

    DatasetService.removeComponent(map, list);

    expect(order).toEqual(['remove:layer', 'remove:source']);
    expect(parent.remove).toHaveBeenCalledWith(list);
  });

  it('removeComponent does not remove sibling layers when multiple list items share composite parent', () => {
    const order: string[] = [];
    const children: ReturnType<typeof createLeafDataset>[] = [];
    const parent = {
      id: 'composite-parent',
      type: 'composite',
      getName: () => 'parent',
      setName: () => undefined,
      getParent: () => undefined,
      setParent: () => undefined,
      addDependsOn: () => undefined,
      removeDependsOn: () => undefined,
      getChildren: () => children,
      add: () => undefined,
      remove: vi.fn((c) => {
        const idx = children.indexOf(c);
        if (idx >= 0) children.splice(idx, 1);
      }),
    } as unknown as IDataset & {
      getChildren: () => IDataset[];
      remove: ReturnType<typeof vi.fn>;
    };

    const layer1 = createLeafDataset('layer-1', { order });
    const list1 = createLeafDataset('list-1', { order });
    list1.type = 'list';
    delete (list1 as { removeFromMap?: unknown }).removeFromMap;

    const layer2 = createLeafDataset('layer-2', { order });
    const list2 = createLeafDataset('list-2', { order });
    list2.type = 'list';
    delete (list2 as { removeFromMap?: unknown }).removeFromMap;

    layer1.getParent = () => parent;
    list1.getParent = () => parent;
    layer2.getParent = () => parent;
    list2.getParent = () => parent;

    children.push(layer1, list1, layer2, list2);

    DatasetService.removeComponent(map, list1);

    // Only list1 should be detached, sibling layer-2 and list-2 remain intact
    expect(order).toEqual([]);
    expect(parent.remove).toHaveBeenCalledWith(list1);
    expect(children).toContain(layer2);
    expect(children).toContain(list2);
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

  it('cleans up parent layer when the only list item of parent composite is removed', () => {
    const order: string[] = [];
    const children: IDataset[] = [];
    const parent = {
      id: 'root-composite',
      type: 'composite',
      getParent: () => undefined,
      getChildren: () => children,
      remove: vi.fn((child: IDataset) => {
        const idx = children.indexOf(child);
        if (idx !== -1) children.splice(idx, 1);
      }),
    } as unknown as IDataset & {
      getChildren: () => IDataset[];
      remove: ReturnType<typeof vi.fn>;
    };

    const mapLayer = createLeafDataset('map-layer-1', { order });
    mapLayer.getParent = () => parent;

    const listItem = createLeafDataset('list-item-1', { order });
    listItem.type = 'list';
    delete (listItem as { removeFromMap?: unknown }).removeFromMap;
    listItem.getParent = () => parent;

    children.push(mapLayer, listItem);

    DatasetService.removeComponent(map, listItem);

    // Because listItem was the only list item of parent, target was parent
    // so the associated mapLayer was cleaned up too.
    expect(order).toEqual(['remove:map-layer-1']);
    expect(parent.remove).toHaveBeenCalledWith(listItem);
    expect(children).toContain(mapLayer);
    expect(children).not.toContain(listItem);
  });
});
