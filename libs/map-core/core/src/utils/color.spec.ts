import { describe, expect, it, vi } from 'vitest';
import { getChartRandomColor } from './color';

describe('color', () => {
  it('getChartRandomColor returns a chart hex color', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(getChartRandomColor()).toBe('#0E9F6E');
    vi.restoreAllMocks();
  });
});
