import {
  emitLiveRecord,
  registerInstance,
  resetInstanceRegistryForTests,
  resetLiveTraceForTests,
} from '@hungpvq/shared-log';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { LiveHookViewer } from './panels/PanelLiveHookViewer';

describe('LiveHookViewer', () => {
  beforeEach(() => {
    resetInstanceRegistryForTests();
    resetLiveTraceForTests();
  });

  afterEach(() => {
    cleanup();
    resetInstanceRegistryForTests();
    resetLiveTraceForTests();
  });

  it('renders instances and traces tabs with 2-part split layouts', async () => {
    const dummyComp = {};
    const meta = registerInstance(dummyComp, {
      framework: 'react',
      component: 'TestComponent',
    });

    emitLiveRecord({
      framework: 'react',
      event: 'component:mount',
      instanceId: meta.id,
      component: meta.component,
      renderCount: 1,
    });

    emitLiveRecord({
      framework: 'react',
      event: 'component:render',
      instanceId: meta.id,
      component: meta.component,
      renderCount: 1,
    });

    emitLiveRecord({
      framework: 'react',
      event: 'component:update',
      instanceId: meta.id,
      component: meta.component,
      renderCount: 2,
      changes: [
        {
          source: 'prop',
          key: 'count',
          previousValue: 0,
          nextValue: 1,
        },
      ],
    });

    const { container } = render(<LiveHookViewer />);

    expect(container.textContent).toContain('TestComponent');
    expect(container.textContent).toContain('Instances');
    expect(container.textContent).toContain('Traces');

    // Default tab is Instances -> should display Instance details on the right
    expect(container.querySelector('aside[aria-label="Instance details"]')).toBeTruthy();
    expect(container.textContent).toContain('Event History');

    // Click trace item in Event History to jump to Traces tab
    const traceItems = container.querySelectorAll('.ui-list-item');
    expect(traceItems.length).toBeGreaterThan(0);
    fireEvent.click(traceItems[0]);

    // Should switch to Traces tab and show Trace details
    expect(container.querySelector('aside[aria-label="Trace details"]')).toBeTruthy();
    expect(container.textContent).toContain('Changed Properties');
    expect(container.textContent).toContain('count');

    // Switch back to Instances tab by clicking tab button
    const tabButtons = container.querySelectorAll('.ui-tabs button');
    expect(tabButtons.length).toBe(2);
    fireEvent.click(tabButtons[0]);

    expect(container.querySelector('aside[aria-label="Instance details"]')).toBeTruthy();
  });
});
