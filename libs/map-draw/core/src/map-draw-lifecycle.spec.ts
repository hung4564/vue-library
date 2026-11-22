import { describe, expect, it, vi } from 'vitest';

import { createMapDrawControl } from './map-draw-lifecycle';

describe('createMapDrawControl', () => {
  it('adds and removes control on a host map', () => {
    const handle = createMapDrawControl();
    const has = vi.fn(() => false);
    const add = vi.fn();
    const remove = vi.fn();
    const map = {
      hasControl: has as (c: never) => boolean,
      addControl: add,
      removeControl: remove,
    };

    handle.addToMap(map);
    expect(add).toHaveBeenCalledWith(handle.control);
    has.mockReturnValue(true);
    handle.removeFromMap(map);
    expect(remove).toHaveBeenCalledWith(handle.control);
  });
});
