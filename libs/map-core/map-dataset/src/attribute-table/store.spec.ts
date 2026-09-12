import type { FeatureCollection } from 'geojson';
import { describe, expect, it, vi } from 'vitest';
import { createDataManagement } from '../data-management';
import { createDatasetPartGeojsonSourceComponent } from '../geojson/source';
import { createRootDataset } from '../model/dataset.base';
import { createDatasetPartListViewUiComponent } from '../model/list';
import {
  ATTRIBUTE_TABLE_DEFAULT_PAGE_SIZE,
  createAttributeTableStoreFromDataset,
  createLocalAttributeTableStore,
  type AttributeTableStore,
} from './store';

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

describe('AttributeTableStore', () => {
  it('defaults page size constant', () => {
    expect(ATTRIBUTE_TABLE_DEFAULT_PAGE_SIZE).toBe(50);
  });

  it('local store pages and selects by intent', async () => {
    const store = createLocalAttributeTableStore(
      fc([
        point('a', 'A'),
        point('b', 'B'),
        point('c', 'C'),
        point('d', 'D'),
      ]),
    );

    const page1 = await store.list({
      intent: 'page',
      page: 1,
      pageSize: 2,
    });
    expect(page1.total).toBe(4);
    expect(page1.rows).toHaveLength(2);
    expect(page1.rows[0]?.cells.name).toBe('A');

    const page2 = await store.list({
      intent: 'page',
      page: 2,
      pageSize: 2,
    });
    expect(page2.rows[0]?.cells.name).toBe('C');

    const selected = await store.list({
      intent: 'select',
      ids: ['a', 'd'],
      pageSize: 'all',
    });
    expect(selected.rows.map((r) => r.cells.name).sort()).toEqual(['A', 'D']);
    expect(selected.total).toBe(2);
  });

  it('local store searches on page intent only', async () => {
    const store = createLocalAttributeTableStore(
      fc([point('a', 'Ha Noi'), point('b', 'Da Nang'), point('c', 'Hue')]),
    );
    const page = await store.list({
      intent: 'page',
      page: 1,
      pageSize: 50,
      search: 'ha',
    });
    expect(page.rows).toHaveLength(1);
    expect(page.rows[0]?.cells.name).toBe('Ha Noi');
  });

  it('fromDataset uses DM list for page and select', async () => {
    const root = createRootDataset('root');
    const list = createDatasetPartListViewUiComponent('Cities');
    const source = createDatasetPartGeojsonSourceComponent('src', {
      type: 'FeatureCollection',
      features: [],
    });
    const management = createDataManagement('dm', {
      store: 'local',
      format: 'feature-collection',
      initData: {
        type: 'FeatureCollection',
        features: [
          point('a', 'A'),
          point('b', 'B'),
          point('c', 'C'),
          point('d', 'D'),
        ],
      },
    });
    root.add(list);
    root.add(source);
    root.add(management);

    const store = createAttributeTableStoreFromDataset(list);
    const page1 = await store.list({
      intent: 'page',
      page: 1,
      pageSize: 2,
    });
    expect(page1.total).toBe(4);
    expect(page1.rows).toHaveLength(2);
    expect(page1.rows[0]?.cells.name).toBe('A');

    const selected = await store.list({
      intent: 'select',
      ids: ['c'],
      pageSize: 'all',
    });
    expect(selected.rows).toHaveLength(1);
    expect(selected.rows[0]?.cells.name).toBe('C');
  });

  it('fromDataset falls back to local GeoJSON without DM', async () => {
    const root = createRootDataset('root');
    const list = createDatasetPartListViewUiComponent('Cities');
    const features = Array.from({ length: 60 }, (_, i) =>
      point(`f${i}`, `N${i}`),
    );
    const source = createDatasetPartGeojsonSourceComponent('src', {
      type: 'FeatureCollection',
      features,
    });
    root.add(list);
    root.add(source);

    const store = createAttributeTableStoreFromDataset(list);
    const page = await store.list({
      intent: 'page',
      page: 2,
      pageSize: 25,
    });
    expect(page.total).toBe(60);
    expect(page.rows).toHaveLength(25);
    expect(page.rows[0]?.cells.name).toBe('N25');
  });

  it('custom store must receive explicit intent', async () => {
    const list = vi.fn(async (query) => {
      expect(query.intent).toBeDefined();
      return { columns: [], rows: [], total: 0 };
    }) satisfies AttributeTableStore['list'];

    const store: AttributeTableStore = { list };
    await store.list({ intent: 'page', page: 1, pageSize: 10 });
    await store.list({ intent: 'select', ids: ['1'], pageSize: 'all' });
    expect(list).toHaveBeenCalledTimes(2);
    expect(list.mock.calls[0]?.[0].intent).toBe('page');
    expect(list.mock.calls[1]?.[0].intent).toBe('select');
  });

  it('local store invalidate clears FeatureCollection cache', async () => {
    const seed = fc([point('a', 'A'), point('b', 'B')]);
    const store = createLocalAttributeTableStore(seed);
    const first = await store.list({ intent: 'page', page: 1, pageSize: 50 });
    expect(first.total).toBe(2);

    seed.features.push(point('c', 'C'));
    // Still cached until invalidate
    const cached = await store.list({ intent: 'page', page: 1, pageSize: 50 });
    expect(cached.total).toBe(2);

    store.invalidate?.();
    const fresh = await store.list({ intent: 'page', page: 1, pageSize: 50 });
    expect(fresh.total).toBe(3);
  });
});
