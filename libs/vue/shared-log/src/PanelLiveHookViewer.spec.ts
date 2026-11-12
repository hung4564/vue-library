import {
  emitLiveRecord,
  registerInstance,
  resetInstanceRegistryForTests,
  resetLiveTraceForTests,
} from '@hungpvq/shared-log';
import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import PanelLiveHookViewer from './PanelLiveHookViewer.vue';
import { useVueLogUiStore } from './store';

describe('PanelLiveHookViewer', () => {
  beforeEach(() => {
    resetInstanceRegistryForTests();
    resetLiveTraceForTests();
  });

  afterEach(() => {
    resetInstanceRegistryForTests();
    resetLiveTraceForTests();
  });

  it('renders toolbar with event filter chips and instance tree', async () => {
    const dummyComp = {};
    const meta = registerInstance(dummyComp, {
      framework: 'vue',
      component: 'TestComponent',
    });

    emitLiveRecord({
      framework: 'vue',
      event: 'component:mount',
      instanceId: meta.id,
      component: meta.component,
      renderCount: 1,
    });

    emitLiveRecord({
      framework: 'vue',
      event: 'component:render',
      instanceId: meta.id,
      component: meta.component,
      renderCount: 1,
    });

    emitLiveRecord({
      framework: 'vue',
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

    // Sync store manually for test
    const store = useVueLogUiStore();
    store.liveInstances.value = [meta];

    const wrapper = mount(PanelLiveHookViewer);
    expect(wrapper.text()).toContain('TestComponent');
    expect(wrapper.text()).toContain('mount');
    expect(wrapper.text()).toContain('update');
    expect(wrapper.text()).toContain('render');

    // Click trace item in Event History to jump to Traces tab
    const items = wrapper.findAll('.ui-list-item');
    expect(items.length).toBeGreaterThan(0);
    await items[0].trigger('click');
    expect(wrapper.find('aside[aria-label="Trace details"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Changed Properties');
    expect(wrapper.text()).toContain('count');

    // Switch back to Instances tab
    const tabButtons = wrapper.findAll('.ui-tabs button');
    expect(tabButtons.length).toBe(2);
    await tabButtons[0].trigger('click');
    expect(wrapper.find('aside[aria-label="Instance details"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Event History');
  });
});
