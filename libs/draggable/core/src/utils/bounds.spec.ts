import { describe, expect, it } from 'vitest';
import { clampBounds } from './bounds';

describe('clampBounds', () => {
  it('keeps bounds inside the container', () => {
    expect(clampBounds(10, 20, 100, 80, 400, 300)).toEqual({
      x: 10,
      y: 20,
      width: 100,
      height: 80,
    });
  });

  it('clamps overflow on the right and bottom', () => {
    expect(clampBounds(350, 250, 100, 80, 400, 300)).toEqual({
      x: 300,
      y: 220,
      width: 100,
      height: 80,
    });
  });

  it('clamps negative origin to zero', () => {
    expect(clampBounds(-20, -10, 50, 40, 400, 300)).toEqual({
      x: 0,
      y: 0,
      width: 50,
      height: 40,
    });
  });

  it('shrinks when larger than the container', () => {
    expect(clampBounds(0, 0, 500, 400, 400, 300)).toEqual({
      x: 0,
      y: 0,
      width: 400,
      height: 300,
    });
  });

  it('handles zero container size without throwing', () => {
    expect(clampBounds(10, 10, 100, 100, 0, 0)).toEqual({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
  });
});
