import {
  getLiveTraceEvents,
  getRegisteredInstances,
  resetInstanceRegistryForTests,
  resetLiveTraceForTests,
} from '@hungpvq/shared-log';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';

import { useLiveHookDebug } from './useLiveHookDebug';

afterEach(() => {
  resetInstanceRegistryForTests();
  resetLiveTraceForTests();
});

describe('useLiveHookDebug', () => {
  it('registers a Vue instance and emits mount/render on the live envelope', () => {
    const Comp = defineComponent({
      setup() {
        const id = useLiveHookDebug('HookProbe');
        expect(id).toMatch(/^vue:/);
        return () => null;
      },
    });
    const wrapper = mount(Comp);
    expect(
      getRegisteredInstances().some((item) => item.component === 'HookProbe'),
    ).toBe(true);
    expect(getLiveTraceEvents().map((event) => event.data.event)).toEqual([
      'component:render',
      'component:mount',
    ]);
    expect(getLiveTraceEvents()[0]?.header.kind).toBe('live');
    wrapper.unmount();
    expect(
      getRegisteredInstances().some((item) => item.component === 'HookProbe'),
    ).toBe(false);
  });
});
