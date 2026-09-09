/**
 * Locks `@hungpvq/react-map-devtools` root **runtime** export surface.
 * Root `index.ts` must use **named** exports only (no public `export *`).
 */
import { describe, expect, it } from 'vitest';
import * as api from './index';

/** Stable root runtime exports (SemVer contract for 1.x). */
export const REACT_MAP_DEVTOOLS_STABLE_RUNTIME_EXPORTS = [
  'clearDevtoolErrors',
  'clearDevtoolLogs',
  'devtoolLogAdapter',
  'DevtoolLogAdapter',
  'Devtools',
  'devtoolState',
  'getDevtoolState',
  'installDevtools',
  'setDevtoolActiveTab',
  'subscribeDevtoolState',
  'toggleDevtoolOpen',
  'uninstallDevtools',
  'useDevtoolState',
] as const;

/** Reserved for future experimental root exports (currently empty). */
export const REACT_MAP_DEVTOOLS_EXPERIMENTAL_RUNTIME_EXPORTS = [] as const;

describe('public API surface', () => {
  it('root runtime exports match Stable + Experimental allowlists', () => {
    const keys = Object.keys(api).sort();
    const expected = [
      ...REACT_MAP_DEVTOOLS_STABLE_RUNTIME_EXPORTS,
      ...REACT_MAP_DEVTOOLS_EXPERIMENTAL_RUNTIME_EXPORTS,
    ].sort();
    expect(keys).toEqual(expected);
  });
});
