/**
 * Locks `@hungpvq/react-map-devtools` root **runtime** export surface.
 * Root `index.ts` must use **named** exports only (no public `export *`).
 */
import { describe, expect, it } from 'vitest';
import * as api from './index';

/** Stable root runtime exports (SemVer contract for 1.x). */
export const REACT_MAP_DEVTOOLS_STABLE_RUNTIME_EXPORTS = [
  'Devtools',
  'installDevtools',
  'uninstallDevtools',
] as const;

/** @experimental — may change in a minor. */
export const REACT_MAP_DEVTOOLS_EXPERIMENTAL_RUNTIME_EXPORTS = [
  'DevtoolLogAdapter',
  'clearDevtoolErrors',
  'clearDevtoolLogs',
  'devtoolLogAdapter',
  'devtoolState',
  'getDevtoolState',
  'setDevtoolActiveTab',
  'subscribeDevtoolState',
  'toggleDevtoolOpen',
  'useDevtoolState',
] as const;

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
