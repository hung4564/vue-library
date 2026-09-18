import mitt from 'mitt';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getOrCreateStore } from '@hungpvq/shared-store';
import { MapInitializationError } from '../errors';
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

function clearSharedTombstones() {
  getOrCreateStore('map:core:meta', () => ({
    removedMapIds: new Set<string>(),
    errorCapture: { installed: false, uninstall: undefined },
  })).removedMapIds.clear();
}

describe('MapStoreManager', () => {
  afterEach(() => {
    UniversalRegistry.clearMap('m1');
    clearSharedTombstones();
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

  it('subscribeMapReady sync when live, waits when pending, unsubscribe cancels', () => {
    const adapter = createAdapter();
    const manager = new MapStoreManager(adapter);
    const map = { id: 'live' } as any;

    const sync = vi.fn();
    const unsubSync = manager.subscribeMapReady('sync', sync);
    expect(sync).not.toHaveBeenCalled();
    unsubSync();

    manager.initMap('sync', map);
    const after = vi.fn();
    const unsubAfter = manager.subscribeMapReady('sync', after);
    expect(after).toHaveBeenCalledWith(map);
    unsubAfter();

    const pending = vi.fn();
    const unsubPending = manager.subscribeMapReady('wait', pending);
    unsubPending();
    manager.initMap('wait', { id: 'w' } as any);
    expect(pending).not.toHaveBeenCalled();

    const waitCb = vi.fn();
    manager.subscribeMapReady('wait2', waitCb);
    manager.initMap('wait2', { id: 'w2' } as any);
    expect(waitCb).toHaveBeenCalledWith({ id: 'w2' });
  });

  it('subscribeMapReady after removeMap does not wait', () => {
    const adapter = createAdapter();
    const manager = new MapStoreManager(adapter);
    manager.initMap('gone', { id: 'map' } as any);
    manager.removeMap('gone');

    const getEmitter = vi.spyOn(adapter, 'getEventEmitter');
    const cb = vi.fn();
    const unsub = manager.subscribeMapReady('gone', cb);
    expect(cb).not.toHaveBeenCalled();
    expect(getEmitter).not.toHaveBeenCalled();
    unsub();
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

  it('destroyScopedStore runs key cleanup before deleting the key', () => {
    const adapter = createAdapter();
    const manager = new MapStoreManager(adapter);
    const seen: unknown[] = [];
    manager.addStore('m1', 'tmp', { a: 1 }, {
      cleanup: () => {
        seen.push(manager.peekStore('m1', 'tmp'));
      },
    });
    manager.destroyScopedStore('m1', 'tmp');
    expect(seen).toEqual([{ a: 1 }]);
    expect(manager.peekStore('m1', 'tmp')).toBeUndefined();
  });

  it('emits READY on initMap', () => {
    const adapter = createAdapter();
    const manager = new MapStoreManager(adapter);
    const onReady = vi.fn();
    adapter.getEventEmitter('m1').on(MAP_CORE_EVENT.READY, onReady);
    manager.initMap('m1', {} as any);
    expect(onReady).toHaveBeenCalled();
  });

  it('getMap(cb) after removeMap does not resurrect the store entry', () => {
    const adapter = createAdapter();
    const manager = new MapStoreManager(adapter);
    manager.initMap('gone', { id: 'map' } as any);
    manager.removeMap('gone');
    expect(adapter.root.gone).toBeUndefined();

    const getEmitter = vi.spyOn(adapter, 'getEventEmitter');
    const cb = vi.fn();
    expect(manager.getMap('gone', cb)).toBeUndefined();
    expect(cb).not.toHaveBeenCalled();
    expect(adapter.root.gone).toBeUndefined();
    expect(getEmitter).not.toHaveBeenCalled();
  });

  it('initMap after removeMap clears the tombstone and allows reuse', () => {
    const adapter = createAdapter();
    const manager = new MapStoreManager(adapter);
    manager.initMap('reuse', { id: 'a' } as any);
    manager.removeMap('reuse');
    const next = { id: 'b' } as any;
    manager.initMap('reuse', next);
    expect(manager.getMap('reuse')).toBe(next);
  });

  it('initMap throws when overwriting a different live map instance', () => {
    const adapter = createAdapter();
    const manager = new MapStoreManager(adapter);
    const first = { id: 'a' } as any;
    manager.initMap('dup', first);
    expect(() => manager.initMap('dup', { id: 'b' } as any)).toThrow(
      MapInitializationError,
    );
    expect(manager.getMap('dup')).toBe(first);
  });

  it('initMap is idempotent for the same map instance', () => {
    const adapter = createAdapter();
    const manager = new MapStoreManager(adapter);
    const map = { id: 'same' } as any;
    manager.initMap('idem', map);
    manager.initMap('idem', map);
    expect(manager.getMap('idem')).toBe(map);
  });

  it('isolates two live mapIds; removeMap(A) does not touch B', () => {
    const adapter = createAdapter();
    const manager = new MapStoreManager(adapter);
    const mapA = { id: 'a' } as any;
    const mapB = { id: 'b' } as any;
    const cleanupA = vi.fn();
    const cleanupB = vi.fn();

    manager.addStore('mapA', 'scoped', {}, { cleanup: cleanupA });
    manager.addStore('mapB', 'scoped', {}, { cleanup: cleanupB });
    manager.initMap('mapA', mapA);
    manager.initMap('mapB', mapB);
    UniversalRegistry.registerMethodForMap('mapA', 'demoA', () => 'a');
    UniversalRegistry.registerMethodForMap('mapB', 'demoB', () => 'b');

    manager.removeMap('mapA');

    expect(cleanupA).toHaveBeenCalled();
    expect(cleanupB).not.toHaveBeenCalled();
    expect(adapter.root.mapA).toBeUndefined();
    expect(manager.getMap('mapB')).toBe(mapB);
    expect(manager.peekStore('mapB', 'scoped')).toEqual({});
    expect(UniversalRegistry.getMethod('demoA', 'mapA')).toBeUndefined();
    expect(UniversalRegistry.getMethod('demoB', 'mapB')).toBeTypeOf('function');

    UniversalRegistry.clearMap('mapB');
  });

  it('shares removeMap tombstones across MapStoreManager instances', () => {
    const managerA = new MapStoreManager(createAdapter());
    const adapterB = createAdapter();
    const managerB = new MapStoreManager(adapterB);

    managerA.initMap('cross', { id: 'map' } as any);
    managerA.removeMap('cross');

    const getEmitter = vi.spyOn(adapterB, 'getEventEmitter');
    const cb = vi.fn();
    const unsub = managerB.subscribeMapReady('cross', cb);
    expect(cb).not.toHaveBeenCalled();
    expect(getEmitter).not.toHaveBeenCalled();
    unsub();

    expect(managerB.getMap('cross', cb)).toBeUndefined();
    expect(cb).not.toHaveBeenCalled();
    expect(getEmitter).not.toHaveBeenCalled();
  });

  it('does not create an empty-string map entry', () => {
    const adapter = createAdapter();
    const manager = new MapStoreManager(adapter);
    adapter.root[''] = { leaked: true };

    expect(manager.getMapStore('')).toBeUndefined();
    expect(manager.peekStore('', 'mitt')).toBeUndefined();
    expect(manager.getMap('', vi.fn())).toBeUndefined();
    expect(manager.subscribeMapReady('', vi.fn())).toEqual(expect.any(Function));
    expect('' in adapter.root).toBe(false);

    expect(() => manager.addStore('', 'mitt', () => ({}))).toThrow(/mapId is required/);
    expect(() => manager.initMap('', { id: 'x' } as any)).toThrow(/mapId is required/);
    expect('' in adapter.root).toBe(false);
  });
});
