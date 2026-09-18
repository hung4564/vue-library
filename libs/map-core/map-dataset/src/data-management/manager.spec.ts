import { describe, expect, it } from 'vitest';
import { createDataManager } from './manager';
import { createLocalStore } from './local-store';
import type { DataHook } from './types';

describe('createDataManager', () => {
  it('cancels create via beforeCreate hook', async () => {
    const store = createLocalStore({
      format: 'list',
      initData: [],
    });
    const hooks: DataHook = {
      beforeCreate() {
        return { cancel: true };
      },
    };
    const manager = createDataManager(store, { hooks });
    const result = await manager.create({ name: 'x' });
    expect(result).toBeUndefined();
    expect((await manager.list({ pageSize: 'all' })).items.length).toBe(0);
  });

  it('buffers draft ops until commit', async () => {
    const store = createLocalStore({
      format: 'list',
      initData: [{ id: '1', name: 'a' }],
    });
    const manager = createDataManager(store, { draft: true });

    await manager.create({ id: '2', name: 'b' });
    await manager.update({ id: '1', name: 'a2' });
    expect((await store.list()).total).toBe(1);
    expect(manager.getDraftItems?.()).toHaveLength(2);

    await manager.commit?.();
    const all = (await manager.list({ pageSize: 'all' })).items;
    expect(all).toHaveLength(2);
    expect(all.find((r) => r.id === '1')?.name).toBe('a2');
    expect(manager.getDraftItems?.()).toHaveLength(0);
  });

  it('discards draft items', async () => {
    const store = createLocalStore({ format: 'list', initData: [] });
    const manager = createDataManager(store, { draft: true });
    await manager.create({ id: '9', name: 'tmp' });
    await manager.discard?.();
    expect(manager.getDraftItems?.()).toHaveLength(0);
    expect((await store.list()).total).toBe(0);
  });
});
