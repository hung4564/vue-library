import { afterEach, describe, expect, it, vi } from 'vitest';
import { UniversalRegistry } from '../registry/universal-registry';
import { MAP_PLATFORM_REGISTRY_METHOD } from './map-platform-keys';
import {
  MAP_PLATFORM_HOST,
  getMap,
  listMapPlatformHosts,
  registerMapAccessor,
  registerMapReadySubscriber,
  registerMapStoreCleanup,
  registerMapStoreCleanupRegistrar,
  resetMapPlatformHostsForTests,
  subscribeMapReady,
} from './map-platform-registry';

describe('map platform registry wiring', () => {
  afterEach(() => {
    resetMapPlatformHostsForTests();
  });

  it('registerMapAccessor / getMap use UniversalRegistry global method', () => {
    const map = { id: 'm' } as any;
    const accessor = vi.fn((_id: string, cb?: (m: typeof map) => void) => {
      cb?.(map);
      return map;
    });
    registerMapAccessor(accessor);

    expect(
      UniversalRegistry.getMethod(MAP_PLATFORM_REGISTRY_METHOD.GET_MAP),
    ).toBeTypeOf('function');
    expect(getMap('m1')).toBe(map);
    // Composite calls host without cb first for sync hit
    expect(accessor).toHaveBeenCalledWith('m1');
  });

  it('clearMap does not remove platform global methods', () => {
    const accessor = vi.fn(() => undefined);
    const ready = vi.fn(() => () => undefined);
    const cleanup = vi.fn();
    registerMapAccessor(accessor);
    registerMapReadySubscriber(ready);
    registerMapStoreCleanupRegistrar(cleanup);

    UniversalRegistry.registerMethodForMap('tmp', 'x', () => 1);
    UniversalRegistry.clearMap('tmp');

    expect(
      UniversalRegistry.getMethod(MAP_PLATFORM_REGISTRY_METHOD.GET_MAP),
    ).toBeTypeOf('function');
    expect(
      UniversalRegistry.getMethod(
        MAP_PLATFORM_REGISTRY_METHOD.SUBSCRIBE_MAP_READY,
      ),
    ).toBeTypeOf('function');
    expect(
      UniversalRegistry.getMethod(
        MAP_PLATFORM_REGISTRY_METHOD.REGISTER_STORE_CLEANUP,
      ),
    ).toBeTypeOf('function');

    expect(subscribeMapReady('a', vi.fn())).toBeTypeOf('function');
    registerMapStoreCleanup('a', 'k', () => undefined);
    expect(cleanup).toHaveBeenCalled();
  });

  it('two hosts coexist — getMap finds map on either host', () => {
    const mapVue = { id: 'vue-map' } as any;
    const mapReact = { id: 'react-map' } as any;
    registerMapAccessor(
      (id) => (id === 'vue' ? mapVue : undefined),
      { hostId: MAP_PLATFORM_HOST.VUE_MAP_CORE },
    );
    registerMapAccessor(
      (id) => (id === 'react' ? mapReact : undefined),
      { hostId: MAP_PLATFORM_HOST.REACT_MAP_CORE },
    );

    expect(getMap('vue')).toBe(mapVue);
    expect(getMap('react')).toBe(mapReact);
    expect(listMapPlatformHosts()).toHaveLength(2);
  });

  it('same hostId replaces previous wiring; unregister restores isolation', () => {
    const first = vi.fn(() => ({ id: 'first' }) as any);
    const second = vi.fn(() => ({ id: 'second' }) as any);
    const reg1 = registerMapAccessor(first, {
      hostId: MAP_PLATFORM_HOST.VUE_MAP_CORE,
    });
    const reg2 = registerMapAccessor(second, {
      hostId: MAP_PLATFORM_HOST.VUE_MAP_CORE,
    });
    expect(reg2.version).toBeGreaterThan(reg1.version);
    expect(getMap('x')?.id).toBe('second');

    reg1.unregister(); // stale — no-op
    expect(getMap('x')?.id).toBe('second');

    reg2.unregister();
    expect(listMapPlatformHosts()).toHaveLength(0);
  });

  it('READY cb fires once when any host becomes ready', () => {
    const seen: string[] = [];
    let vueReady: ((m: any) => void) | undefined;
    registerMapReadySubscriber(
      (_id, cb) => {
        vueReady = cb;
        return () => {
          vueReady = undefined;
        };
      },
      { hostId: MAP_PLATFORM_HOST.VUE_MAP_CORE },
    );
    registerMapReadySubscriber(
      () => () => undefined,
      { hostId: MAP_PLATFORM_HOST.REACT_MAP_CORE },
    );

    const unsub = subscribeMapReady('m', (m) => seen.push(m.id));
    vueReady?.({ id: 'from-vue' });
    vueReady?.({ id: 'again' });
    expect(seen).toEqual(['from-vue']);
    unsub();
  });
});
