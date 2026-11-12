import {
  getLiveTraceEvents,
  getRegisteredInstances,
  resetInstanceRegistryForTests,
  resetLiveTraceForTests,
} from '@hungpvq/shared-log';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { LiveHookScope, useLiveHookDebug } from './useLiveHookDebug';

afterEach(() => {
  cleanup();
  resetInstanceRegistryForTests();
  resetLiveTraceForTests();
});

function Probe({ label }: { label: string }) {
  const id = useLiveHookDebug(label);
  return <span data-testid="id">{id}</span>;
}

describe('useLiveHookDebug', () => {
  it('registers a React instance and emits mount/render on the live envelope', () => {
    const { getByTestId, unmount } = render(<Probe label="HookProbe" />);
    expect(getByTestId('id').textContent).toMatch(/^react:/);
    expect(
      getRegisteredInstances().some((item) => item.component === 'HookProbe'),
    ).toBe(true);
    expect(getLiveTraceEvents().map((event) => event.data.event)).toEqual([
      'component:render',
      'component:mount',
    ]);
    expect(getLiveTraceEvents()[0]?.header.kind).toBe('live');
    unmount();
    expect(
      getRegisteredInstances().some((item) => item.component === 'HookProbe'),
    ).toBe(false);
  });

  it('nests children under LiveHookScope parentId', () => {
    function Parent() {
      const id = useLiveHookDebug('ParentProbe');
      return (
        <LiveHookScope id={id}>
          <Probe label="ChildProbe" />
        </LiveHookScope>
      );
    }
    render(<Parent />);
    const parent = getRegisteredInstances().find(
      (item) => item.component === 'ParentProbe',
    );
    const child = getRegisteredInstances().find(
      (item) => item.component === 'ChildProbe',
    );
    expect(parent?.id).toBeTruthy();
    expect(child?.parentId).toBe(parent?.id);
  });
});
