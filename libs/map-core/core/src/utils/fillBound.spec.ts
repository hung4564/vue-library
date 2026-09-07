import { describe, expect, it, vi } from 'vitest';
import { bboxFromGeojson, convertGeometry, fitBounds } from './fillBound';

describe('fillBound', () => {
  it('convertGeometry builds a LineString feature', () => {
    const feature = convertGeometry([
      [0, 0],
      [1, 1],
    ]);
    expect(feature.type).toBe('Feature');
    expect(feature.geometry.type).toBe('LineString');
  });

  it('bboxFromGeojson returns turf bbox', () => {
    const box = bboxFromGeojson({
      type: 'Point',
      coordinates: [105, 21],
    });
    expect(box).toEqual([105, 21, 105, 21]);
  });

  it('fitBounds calls map.fitBounds for corner pair', () => {
    const map = { fitBounds: vi.fn() };
    fitBounds(map as never, [
      [0, 0],
      [1, 1],
    ]);
    expect(map.fitBounds).toHaveBeenCalledOnce();
    expect(map.fitBounds.mock.calls[0][1]).toMatchObject({ maxZoom: 15 });
  });

  it('fitBounds no-ops without map or value', () => {
    expect(() => fitBounds(undefined as never, null)).not.toThrow();
  });
});
