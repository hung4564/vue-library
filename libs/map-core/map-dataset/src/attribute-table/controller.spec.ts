import type { FeatureCollection } from 'geojson';
import { describe, expect, it, vi } from 'vitest';
import { createAttributeTableController } from './controller';
import { createLocalAttributeTableStore } from './store';
import type { AttributeTableStore } from './store';
import type { IDataset } from '../interfaces/dataset.base';

const point = (id: string, name: string) => ({
  type: 'Feature' as const,
  id,
  properties: { name },
  geometry: { type: 'Point' as const, coordinates: [0, 0] },
});

const fc = (features: ReturnType<typeof point>[]): FeatureCollection => ({
  type: 'FeatureCollection',
  features,
});

const fakeLayer = { id: 'layer' } as IDataset;

describe('createAttributeTableController', () => {
  it('loads pages via store.list intent page', async () => {
    const list = vi.fn(async (query) => {
      expect(query.intent).toBe('page');
      return {
        columns: [{ key: 'name', label: 'name' }],
        rows: [
          {
            id: '0:a',
            cells: { name: 'A' },
            feature: point('a', 'A'),
          },
        ],
        total: 1,
      };
    }) satisfies AttributeTableStore['list'];

    const controller = createAttributeTableController(fakeLayer, {
      store: { list },
    });
    await controller.load('initial');
    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({ intent: 'page', page: 1 }),
    );
    expect(controller.getState().rows).toHaveLength(1);
    controller.dispose();
  });

  it('resolveFeaturesForSelection reuses page rows before select list', async () => {
    const list = vi.fn(async (query) => {
      if (query.intent === 'page') {
        return {
          columns: [{ key: 'name', label: 'name' }],
          rows: [
            {
              id: '0:a',
              cells: { name: 'A' },
              feature: point('a', 'A'),
            },
            {
              id: '1:b',
              cells: { name: 'B' },
              feature: point('b', 'B'),
            },
          ],
          total: 2,
        };
      }
      return {
        columns: [{ key: 'name', label: 'name' }],
        rows: [
          {
            id: '2:c',
            cells: { name: 'C' },
            feature: point('c', 'C'),
          },
        ],
        total: 1,
      };
    }) satisfies AttributeTableStore['list'];

    const controller = createAttributeTableController(fakeLayer, {
      store: { list },
    });
    await controller.load('initial');

    const onlyPage = await controller.resolveFeaturesForSelection(['0:a']);
    expect(onlyPage).toHaveLength(1);
    expect(list.mock.calls.filter((c) => c[0].intent === 'select')).toHaveLength(
      0,
    );

    const mixed = await controller.resolveFeaturesForSelection(['0:a', 'c']);
    expect(mixed.map((r) => r.cells.name).sort()).toEqual(['A', 'C']);
    expect(
      list.mock.calls.some(
        (c) => c[0].intent === 'select' && c[0].ids?.includes('c'),
      ),
    ).toBe(true);
    controller.dispose();
  });

  it('does not call select list when all selected rows are on the page', async () => {
    const store = createLocalAttributeTableStore(
      fc([point('a', 'A'), point('b', 'B'), point('c', 'C')]),
    );
    const list = vi.spyOn(store, 'list');
    const controller = createAttributeTableController(fakeLayer, { store });
    await controller.load('initial');
    list.mockClear();

    await controller.toggleRow(controller.getState().rows[0]!);
    const resolved = await controller.resolveFeaturesForSelection();
    expect(resolved).toHaveLength(1);
    expect(list).not.toHaveBeenCalled();
    controller.dispose();
  });

  it('selectIds shows off-page Identify hits under rowFilter selected', async () => {
    const features = Array.from({ length: 60 }, (_, i) =>
      point(`id-${i}`, `N${i}`),
    );
    // Put the target near the end so page 1 (size 50) does not include it.
    features[55] = {
      type: 'Feature' as const,
      id: 'f:55',
      properties: { _id: 'f:55', name: 'Hit' },
      geometry: { type: 'Point' as const, coordinates: [105.8, 21.0] },
    };
    const store = createLocalAttributeTableStore(fc(features));
    const controller = createAttributeTableController(fakeLayer, {
      store,
      pageSize: 50,
    });
    await controller.load('initial');
    expect(controller.getState().rows).toHaveLength(50);

    await controller.selectIds(['f:55']);
    const state = controller.getState();
    expect(state.rowFilter).toBe('selected');
    expect(state.selectedIds.length).toBe(1);
    expect(state.rows).toHaveLength(1);
    expect(state.rows[0]?.cells.name).toBe('Hit');
    expect(state.total).toBe(1);
    controller.dispose();
  });

  it('skips toggleSort when sortable option is false', async () => {
    const store = createLocalAttributeTableStore(
      fc([point('b', 'B'), point('a', 'A')]),
    );
    const controller = createAttributeTableController(fakeLayer, {
      store,
      sortable: false,
      columns: [{ key: 'name', label: 'Name' }],
    });
    await controller.load('initial');
    controller.toggleSort('name');
    expect(controller.getState().sortStates).toEqual([]);
    controller.dispose();
  });

  it('skips toggleSort for columns with sortable false', async () => {
    const store = createLocalAttributeTableStore(
      fc([point('b', 'B'), point('a', 'A')]),
      {
        columns: [
          { key: 'name', label: 'Name', sortable: false },
          { key: 'id', label: 'ID' },
        ],
      },
    );
    const controller = createAttributeTableController(fakeLayer, {
      store,
      columns: [
        { key: 'name', label: 'Name', sortable: false },
        { key: 'id', label: 'ID' },
      ],
    });
    await controller.load('initial');
    controller.toggleSort('name');
    expect(controller.getState().sortStates).toEqual([]);
    controller.toggleSort('id');
    expect(controller.getState().sortStates).toEqual([
      { key: 'id', dir: 'asc' },
    ]);
    controller.dispose();
  });
});
