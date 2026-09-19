import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MAP_STORE_KEY } from '../types/constants';
import {
  clearMapDomainStoreFactories,
  ensureMapDomainStore,
  hasMapDomainStoreFactory,
  registerMapDomainStoreFactory,
} from './map-domain-store';
import { getMapCoreRootStore } from './map-core-meta';
import * as platform from './map-platform-registry';

describe('map-domain-store', () => {
  beforeEach(() => {
    clearMapDomainStoreFactories();
    const root = getMapCoreRootStore();
    for (const key of Object.keys(root)) {
      delete root[key];
    }
    vi.restoreAllMocks();
  });

  it('throws when no factory is registered', () => {
    expect(() => ensureMapDomainStore('map-1', 'unknown')).toThrow(
      /No domain store factory/,
    );
  });

  it('throws when mapId is empty', () => {
    registerMapDomainStoreFactory('x', { create: () => ({}) });
    expect(() => ensureMapDomainStore('', 'x')).toThrow(/mapId is required/);
  });

  it('creates once and returns the same bag', () => {
    let creates = 0;
    registerMapDomainStoreFactory(MAP_STORE_KEY.EVENT, {
      create: () => {
        creates += 1;
        return { items: [] as string[], current: {} };
      },
    });

    const a = ensureMapDomainStore<{ items: string[] }>('map-1', MAP_STORE_KEY.EVENT);
    const b = ensureMapDomainStore<{ items: string[] }>('map-1', MAP_STORE_KEY.EVENT);
    expect(a).toBe(b);
    expect(creates).toBe(1);
    expect(getMapCoreRootStore()['map-1']?.[MAP_STORE_KEY.EVENT]).toBe(a);
  });

  it('registers cleanup once via platform registrar', () => {
    const registerCleanup = vi.spyOn(platform, 'registerMapStoreCleanup');
    const cleanup = vi.fn();
    registerMapDomainStoreFactory('with-cleanup', {
      create: () => ({ n: 1 }),
      cleanup,
    });

    ensureMapDomainStore('map-2', 'with-cleanup');
    ensureMapDomainStore('map-2', 'with-cleanup');
    expect(registerCleanup).toHaveBeenCalledTimes(1);
    expect(registerCleanup).toHaveBeenCalledWith(
      'map-2',
      'with-cleanup',
      expect.any(Function),
    );

    const registered = registerCleanup.mock.calls[0][2];
    registered();
    expect(cleanup).toHaveBeenCalledWith('map-2', { n: 1 });
  });

  it('hasMapDomainStoreFactory tracks registration', () => {
    expect(hasMapDomainStoreFactory('k')).toBe(false);
    registerMapDomainStoreFactory('k', { create: () => 1 });
    expect(hasMapDomainStoreFactory('k')).toBe(true);
    clearMapDomainStoreFactories();
    expect(hasMapDomainStoreFactory('k')).toBe(false);
  });
});
