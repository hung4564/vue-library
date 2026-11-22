import {
  type MapSimple,
  registerMapAccessor,
  registerMapReadySubscriber,
} from '@hungpvq/map-core';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useEventListener } from './useEvent';

const MAP_ID = 'react-use-event-listener';

afterEach(() => {
  registerMapAccessor(() => undefined);
  registerMapReadySubscriber(() => () => undefined);
  cleanup();
});

describe('useEventListener', () => {
  it('does not attach map.on when unmounted before READY', () => {
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

    function Host() {
      useEventListener(MAP_ID, 'click', () => undefined);
      return null;
    }

    const { unmount } = render(<Host />);
    expect(pending).toBeTypeOf('function');
    unmount();
    pending?.(fakeMap);
    expect(mapOn).not.toHaveBeenCalled();
  });
});
