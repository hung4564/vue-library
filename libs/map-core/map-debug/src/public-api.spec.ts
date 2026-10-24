/**
 * Locks `@hungpvq/map-debug` root **runtime** export surface (Experimental).
 */
import { describe, expect, it } from 'vitest';

import * as api from './index';

export const MAP_DEBUG_EXPERIMENTAL_RUNTIME_EXPORTS = [
  'DEVTOOLS_CONTROL',
  'addClearFunctionLog',
  'clearFunctionLog',
  'getDatasetStore',
  'getMapBag',
  'getMapDebugStore',
  'getMapScopedStore',
  'isMapDevtoolsInstalled',
  'listMapIds',
  'MAP_DEBUG_STORE_KEY',
  'markMapDevtoolsInstalled',
  'setMapDevtoolsInstalled',
  'snapshotMapScopedStore',
] as const;

describe('public API surface', () => {
  it('root runtime exports match Experimental allowlist', () => {
    const keys = Object.keys(api).sort();
    const expected = [...MAP_DEBUG_EXPERIMENTAL_RUNTIME_EXPORTS].sort();
    expect(keys).toEqual(expected);
  });
});
