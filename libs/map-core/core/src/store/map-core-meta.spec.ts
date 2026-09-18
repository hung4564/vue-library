import { beforeEach, describe, expect, it } from 'vitest';
import { MAP_STORE_KEY } from '../types/constants';
import {
  createMapCoreMetaRegistry,
  getMapCoreMetaStore,
  getMapCoreRootStore,
} from './map-core-meta';

describe('createMapCoreMetaRegistry', () => {
  beforeEach(() => {
    getMapCoreMetaStore().registries.clear();
    const root = getMapCoreRootStore();
    for (const id of Object.keys(root)) {
      delete root[id];
    }
  });

  it('stores default on map:core:meta and per-map on map:core[mapId].resolver', () => {
    const reg = createMapCoreMetaRegistry({
      key: 'identify-resolver',
      createDefault: () => ({ id: 'default' }),
    });

    expect(reg.getDefault()).toEqual({ id: 'default' });
    expect(getMapCoreMetaStore().registries.has('identify-resolver')).toBe(
      true,
    );

    const custom = { id: 'map-a' };
    reg.set('m1', custom);

    const scoped = getMapCoreRootStore()['m1']?.[MAP_STORE_KEY.RESOLVER] as
      Record<string, unknown> | undefined;
    expect(scoped?.['identify-resolver']).toBe(custom);
    expect(reg.get('m1')).toBe(custom);
    expect(reg.get('m2')).toEqual({ id: 'default' });

    reg.set('m1', null);
    expect(reg.get('m1')).toEqual({ id: 'default' });
    expect(
      getMapCoreRootStore()['m1']?.[MAP_STORE_KEY.RESOLVER],
    ).toBeUndefined();

    const nextDefault = { id: 'next' };
    reg.setDefault(nextDefault);
    expect(reg.getDefault()).toBe(nextDefault);
    expect(reg.get('m2')).toBe(nextDefault);
  });
});
