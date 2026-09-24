import { describe, expect, it, vi } from 'vitest';

import {
  bearingToCompassTransform,
  resetBearing,
  resolveOriginalEvent,
  zoomIn,
  zoomOut,
} from './navigation';

describe('navigation control helpers', () => {
  it('resolveOriginalEvent unwraps React synthetic events', () => {
    const native = { type: 'click' };
    expect(resolveOriginalEvent({ nativeEvent: native })).toBe(native);
    expect(resolveOriginalEvent(native)).toBe(native);
    expect(resolveOriginalEvent(undefined)).toBeUndefined();
    expect(resolveOriginalEvent({ foo: 1 })).toBeUndefined();
  });

  it('zoomIn / zoomOut / resetBearing call map APIs', () => {
    const map = {
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
      easeTo: vi.fn(),
    } as any;
    zoomIn(map);
    zoomOut(map);
    resetBearing(map);
    expect(map.zoomIn).toHaveBeenCalled();
    expect(map.zoomOut).toHaveBeenCalled();
    expect(map.easeTo).toHaveBeenCalledWith({ bearing: 0, pitch: 0 });
  });

  it('bearingToCompassTransform', () => {
    expect(bearingToCompassTransform(90)).toBe('rotate(-90deg)');
  });
});
