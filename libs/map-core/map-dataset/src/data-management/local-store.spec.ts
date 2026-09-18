import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createLocalStore } from './local-store';

const KEY = 'dm-local-store-test';

const memory = new Map<string, string>();
const storageMock: Storage = {
  get length() {
    return memory.size;
  },
  clear() {
    memory.clear();
  },
  getItem(key: string) {
    return memory.has(key) ? memory.get(key)! : null;
  },
  key(index: number) {
    return [...memory.keys()][index] ?? null;
  },
  removeItem(key: string) {
    memory.delete(key);
  },
  setItem(key: string, value: string) {
    memory.set(key, String(value));
  },
};

beforeEach(() => {
  memory.clear();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: storageMock,
  });
});

afterEach(() => {
  memory.clear();
});

describe('createLocalStore', () => {
  it('supports CRUD and persistence', async () => {
    const store = createLocalStore({
      persistKey: KEY,
      format: 'list',
      initData: [
        {
          id: '1',
          name: 'one',
          geometry: { type: 'Point', coordinates: [105, 21] },
        },
      ],
    });

    const listed = await store.list();
    expect(listed.total).toBe(1);

    const created = await store.create({
      name: 'two',
      geometry: { type: 'Point', coordinates: [106, 21] },
    });
    expect(created.id).toBeTruthy();

    const updated = await store.update({
      id: created.id!,
      name: 'two-updated',
    });
    expect(updated.name).toBe('two-updated');

    await store.delete(created.id!);
    expect((await store.list()).total).toBe(1);
    expect(storageMock.getItem(KEY)).toBeTruthy();

    const reloaded = createLocalStore({ persistKey: KEY, format: 'list' });
    expect((await reloaded.list()).total).toBe(1);
  });

  it('paginates results', async () => {
    const store = createLocalStore({
      format: 'list',
      initData: [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
        { id: 3, name: 'c' },
      ],
    });
    const page = await store.list({ page: 2, pageSize: 2 });
    expect(page.items.map((i) => i.id)).toEqual([3]);
    expect(page.total).toBe(3);
    expect(page.page).toBe(2);
  });

  it('filters by point intersection', async () => {
    const store = createLocalStore({
      format: 'list',
      initData: [
        {
          id: 1,
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [2, 0],
                [2, 2],
                [0, 2],
                [0, 0],
              ],
            ],
          },
        },
        {
          id: 2,
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [10, 10],
                [12, 10],
                [12, 12],
                [10, 12],
                [10, 10],
              ],
            ],
          },
        },
      ],
    });
    const hit = await store.list({ point: [1, 1] });
    expect(hit.items.map((i) => i.id)).toEqual([1]);
  });
});
