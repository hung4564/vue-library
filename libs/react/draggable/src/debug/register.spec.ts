import {
  peekHungpvqDebugHost,
  resetHungpvqDebugHostForTests,
} from '@hungpvq/shared-log';
import { afterEach, describe, expect, it } from 'vitest';

import { useDragStore } from '@hungpvq/draggable';
import { registerDragDebugTab } from './register';

afterEach(() => {
  useDragStore().debugTabUnsub?.();
  resetHungpvqDebugHostForTests();
});

describe('registerDragDebugTab', () => {
  it('registers a React Draggable tab once', () => {
    const first = registerDragDebugTab();
    const second = registerDragDebugTab();
    expect(first).toBe(second);
    const ids = peekHungpvqDebugHost()
      ?.listTabs('react')
      .map((tab) => tab.id);
    expect(ids).toContain('draggable');
  });

  it('re-registers after the host is reset', () => {
    registerDragDebugTab();
    resetHungpvqDebugHostForTests();
    registerDragDebugTab();
    expect(
      peekHungpvqDebugHost()
        ?.listTabs('react')
        .some((tab) => tab.id === 'draggable'),
    ).toBe(true);
  });
});
