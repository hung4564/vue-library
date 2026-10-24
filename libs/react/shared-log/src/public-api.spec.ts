import { describe, expect, it } from 'vitest';

import * as api from './index';

export const REACT_SHARED_LOG_RUNTIME_EXPORTS = [
  'Devtools',
  'DevtoolsShell',
  'registerBuiltinDebugTabs',
  'registerDebugTab',
  'TreeItem',
] as const;

describe('public API surface', () => {
  it('root runtime exports match allowlist', () => {
    expect(Object.keys(api).sort()).toEqual(
      [...REACT_SHARED_LOG_RUNTIME_EXPORTS].sort(),
    );
  });
});
