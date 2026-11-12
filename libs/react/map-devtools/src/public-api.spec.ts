import { describe, expect, it } from 'vitest';

import * as api from './index';

export const REACT_MAP_DEVTOOLS_STABLE_RUNTIME_EXPORTS = [
  'Devtools',
  'DevtoolsControl',
  'installDatasetDebug',
  'installDevtools',
  'uninstallDevtools',
  'useDevtoolState',
] as const;

describe('public API surface', () => {
  it('root runtime exports match allowlist', () => {
    expect(Object.keys(api).sort()).toEqual(
      [...REACT_MAP_DEVTOOLS_STABLE_RUNTIME_EXPORTS].sort(),
    );
  });
});
