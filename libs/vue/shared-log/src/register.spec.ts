import { ensureHungpvqDebugHost } from '@hungpvq/shared-log';
import { describe, expect, it } from 'vitest';
import { isReactive, reactive } from 'vue';

import { registerDebugTab } from './register';

describe('registerDebugTab', () => {
  it('marks the tab component raw so Vue does not wrap it', () => {
    const component = { __name: 'DemoTab' };
    const stop = registerDebugTab({
      id: 'raw-test',
      label: 'Raw',
      component,
    });
    try {
      const tab = ensureHungpvqDebugHost()
        .listTabs('vue')
        .find((item) => item.id === 'raw-test');
      expect(tab?.component).toBe(component);
      const wrapped = reactive({ tab });
      expect(isReactive(wrapped.tab?.component)).toBe(false);
    } finally {
      stop();
    }
  });
});
