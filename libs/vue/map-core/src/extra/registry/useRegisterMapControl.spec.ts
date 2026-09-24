import { UniversalRegistry } from '@hungpvq/map-core';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, ref } from 'vue';

import { useRegisterMapControl } from './useRegisterMapControl';

const MAP_ID = 'vue-register-control';

afterEach(() => {
  UniversalRegistry.clearMap(MAP_ID);
});

describe('useRegisterMapControl', () => {
  it('unregisters on unmount without throwing', () => {
    const show = ref(false);
    const Host = defineComponent({
      setup() {
        useRegisterMapControl(MAP_ID, {
          id: 'demo-control',
          panelKind: 'button',
          title: 'Demo',
          show,
          setShow: (v) => {
            show.value = v;
          },
        });
        return () => null;
      },
    });

    const wrapper = mount(Host);
    expect(UniversalRegistry.getControl('demo-control', MAP_ID)).toBeTruthy();
    expect(() => wrapper.unmount()).not.toThrow();
    expect(
      UniversalRegistry.getControl('demo-control', MAP_ID),
    ).toBeUndefined();
  });
});
