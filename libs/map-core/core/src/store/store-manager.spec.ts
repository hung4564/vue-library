import mitt from 'mitt';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UniversalRegistry } from '../registry/universal-registry';
import type { IMapStoreAdapter } from './interface';
import { MAP_CORE_EVENT, MapStoreManager } from './store-manager';

function createAdapter(): IMapStoreAdapter & { root: Record<string, any> } {
  const root: Record<string, any> = {};
  const emitters = new Map<string, ReturnType<typeof mitt>>();
  return {
    root,
    getRootStore: () => root,
    getEventEmitter: (mapId: string) => {
      if (!emitters.has(mapId)) emitters.set(mapId, mitt());
      return emitters.get(mapId)!;
    },
  };
}

describe('MapStoreManager', () => {
  afterEach(() => {
    UniversalRegistry.clearMap('m1');
  });

  it('addStore / peekStore / getStore initialize and reuse keys', () => {
    const adapter = createAdapter();
    const manager = new MapStoreManager(adapter);

    const created = manager.addStore('m1', 'events', () => ({ items: [] }));
    expect(created).toEqual({ items: [] });
    expect(manager.peekStore('m1', 'events')).toBe(created);
    expect(manager.getStore('m1', 'events')).toBe(created);
    expect(manager.addStore('m1', 'events', { items: ['x'] })).toBe(created);
  });

  it('initMap and getMap callback', () => {
    const adapter = createAdapter();
    const manager = new MapStoreManager(adapter);
    const mapA = { id: 'a' } as any;

    manager.initMap('single', mapA);
    expect(manager.getMap('single')).toBe(mapA);

    const seen: any[] = [];
    manager.getMap('single', (m) => seen.push(m));
    expect(seen).toEqual([mapA]);
  });

  it('getMap waits for READY when map not ready yet', () => {
    const adapter = createAdapter();
    const manager = new MapStoreManager(adapter);
    const cb = vi.fn();

    expect(manager.getMap('later', cb)).toBeUndefined();
    manager.initMap('later', { id: 'ready' } as any);
    expect(cb).toHaveBeenCalledWith({ id: 'ready' });
  });

  it('cleanup runs on removeMap and clears UniversalRegistry map scope', () => {
    const adapter = createAdapter();
    const manager = new MapStoreManager(adapter);
    const cleanup = vi.fn();

    UniversalRegistry.registerMethodForMap('m1', 'demo', () => 'x');
    manager.addStore('m1', 'scoped', {}, { cleanup });
    manager.initMap('m1', { id: 'map' } as any);
    manager.removeMap('m1');

    expect(cleanup).toHaveBeenCalled();
    expect(adapter.root.m1).toBeUndefined();
    expect(UniversalRegistry.getMethod('demo', 'm1')).toBeUndefined();
  });

  it('destroyScopedStore removes key and runs key cleanup', () => {
    const adapter = createAdapter();
    const manager = new MapStoreManager(adapter);
    const cleanup = vi.fn();
    manager.addStore('m1', 'tmp', { a: 1 }, { cleanup });
    manager.destroyScopedStore('m1', 'tmp');
    expect(manager.peekStore('m1', 'tmp')).toBeUndefined();
    expect(cleanup).toHaveBeenCalled();
  });

  it('emits READY on initMap', () => {
    const adapter = createAdapter();
    const manager = new MapStoreManager(adapter);
    const onReady = vi.fn();
    adapter.getEventEmitter('m1').on(MAP_CORE_EVENT.READY, onReady);
    manager.initMap('m1', {} as any);
    expect(onReady).toHaveBeenCalled();
  });
});
