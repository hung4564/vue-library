import {
  peekHungpvqDebugHost,
  resetHungpvqDebugHostForTests,
} from '@hungpvq/shared-log';
import { afterEach, describe, expect, it } from 'vitest';

import { registerDragDebugTab } from './register';

afterEach(() => {
  resetHungpvqDebugHostForTests();
});

describe('registerDragDebugTab', () => {
  it('registers a Vue Draggable tab and unregisters on cleanup', () => {
    const stop = registerDragDebugTab();
    const ids = peekHungpvqDebugHost()
      ?.listTabs('vue')
      .map((tab) => tab.id);
    expect(ids).toContain('draggable');

    stop();
    const afterIds = peekHungpvqDebugHost()
      ?.listTabs('vue')
      .map((tab) => tab.id);
    expect(afterIds).not.toContain('draggable');
  });

  it('re-registers after the host is reset', () => {
    registerDragDebugTab();
    resetHungpvqDebugHostForTests();
    registerDragDebugTab();
    expect(
      peekHungpvqDebugHost()
        ?.listTabs('vue')
        .some((tab) => tab.id === 'draggable'),
    ).toBe(true);
  });
});
