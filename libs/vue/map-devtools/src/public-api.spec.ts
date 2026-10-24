import { describe, expect, it } from 'vitest';

import * as api from './index';

export const VUE_MAP_DEVTOOLS_STABLE_RUNTIME_EXPORTS = [
  'Devtools',
  'DevtoolsControl',
  'installDevtools',
  'openMapDevtoolsErrors',
  'uninstallDevtools',
  'useDevtoolState',
] as const;

export const VUE_MAP_DEVTOOLS_EXPERIMENTAL_RUNTIME_EXPORTS = [] as const;

describe('public API surface', () => {
  it('root runtime exports match Stable + Experimental allowlists', () => {
    const keys = Object.keys(api).sort();
    const expected = [
      ...VUE_MAP_DEVTOOLS_STABLE_RUNTIME_EXPORTS,
      ...VUE_MAP_DEVTOOLS_EXPERIMENTAL_RUNTIME_EXPORTS,
    ].sort();
    expect(keys).toEqual(expected);
  });
});
