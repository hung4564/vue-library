import {
  type MapSimple,
  registerMapAccessor,
  registerMapReadySubscriber,
} from '@hungpvq/map-core';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';

import { useEventListener } from './useEvent';

const MAP_ID = 'vue-use-event-listener';

afterEach(() => {
  registerMapAccessor(() => undefined);
  registerMapReadySubscriber(() => () => undefined);
});

describe('useEventListener', () => {
  it('does not attach map.on when unmounted before READY', async () => {
    let pending: ((map: MapSimple) => void) | undefined;
    const mapOn = vi.fn();
    const fakeMap = {
      id: MAP_ID,
      on: mapOn,
      off: vi.fn(),
    } as unknown as MapSimple;

    registerMapAccessor((mapId, cb) => {
      if (mapId !== MAP_ID) return undefined;
      if (typeof cb === 'function') pending = cb;
      return undefined;
    });
    registerMapReadySubscriber((mapId, cb) => {
      if (mapId !== MAP_ID) return () => undefined;
      pending = cb;
      return () => {
        pending = undefined;
      };
    });

    const Host = defineComponent({
      setup() {
        useEventListener(MAP_ID, 'click', () => undefined);
        return () => null;
      },
    });

    const wrapper = mount(Host);
    expect(pending).toBeTypeOf('function');
    wrapper.unmount();
    pending?.(fakeMap);
    expect(mapOn).not.toHaveBeenCalled();
  });
});
