import { describe, expect, it } from 'vitest';

import * as api from './index';

describe('react-shared-log register', () => {
  it('exposes registerDebugTab and registerBuiltinDebugTabs', () => {
    expect(typeof api.registerDebugTab).toBe('function');
    expect(typeof api.registerBuiltinDebugTabs).toBe('function');
  });
});
