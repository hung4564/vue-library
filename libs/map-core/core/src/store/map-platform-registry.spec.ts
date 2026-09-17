import { describe, expect, it, vi } from 'vitest';
import { UniversalRegistry } from '../registry/universal-registry';
import { MAP_PLATFORM_REGISTRY_METHOD } from './map-platform-keys';
import {
  getMap,
  registerMapAccessor,
  registerMapReadySubscriber,
  registerMapStoreCleanup,
  registerMapStoreCleanupRegistrar,
  subscribeMapReady,
} from './map-platform-registry';

describe('map platform registry wiring', () => {
  it('registerMapAccessor / getMap use UniversalRegistry global method', () => {
    const map = { id: 'm' } as any;
    const accessor = vi.fn((_id: string, cb?: (m: typeof map) => void) => {
      cb?.(map);
      return map;
    });
    registerMapAccessor(accessor);

    expect(
      UniversalRegistry.getMethod(MAP_PLATFORM_REGISTRY_METHOD.GET_MAP),
    ).toBe(accessor);
    expect(getMap('m1')).toBe(map);
    expect(accessor).toHaveBeenCalledWith('m1', undefined);
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
    ).toBe(accessor);
    expect(
      UniversalRegistry.getMethod(
        MAP_PLATFORM_REGISTRY_METHOD.SUBSCRIBE_MAP_READY,
      ),
    ).toBe(ready);
    expect(
      UniversalRegistry.getMethod(
        MAP_PLATFORM_REGISTRY_METHOD.REGISTER_STORE_CLEANUP,
      ),
    ).toBe(cleanup);

    expect(subscribeMapReady('a', vi.fn())).toBeTypeOf('function');
    registerMapStoreCleanup('a', 'k', () => undefined);
    expect(cleanup).toHaveBeenCalled();
  });
});
