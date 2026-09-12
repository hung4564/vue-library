import * as api from './index';

/** Stable runtime surface for `@hungpvq/shared-store` (root). */
export const SHARED_STORE_STABLE_RUNTIME_EXPORTS = [
  'GlobalStoreService',
  'createStoreRegistryPlugin',
  'defineStore',
  'useStoreRegistry',
] as const;

describe('@hungpvq/shared-store public API', () => {
  it('root runtime exports match Stable allowlist', () => {
    expect(Object.keys(api).sort()).toEqual(
      [...SHARED_STORE_STABLE_RUNTIME_EXPORTS].sort(),
    );
  });
});
