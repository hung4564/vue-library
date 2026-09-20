import { describe, expect, it, vi } from 'vitest';
import { getChartColorAt, getChartRandomColor } from './color';

describe('color', () => {
  it('getChartRandomColor returns a chart hex color', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(getChartRandomColor()).toBe('#0E9F6E');
    vi.restoreAllMocks();
  });

  it('getChartColorAt returns stable chart colors by index', () => {
    expect(getChartColorAt(0)).toBe('#0E9F6E');
    expect(getChartColorAt(1)).toBe('#84A2AE');
    expect(getChartColorAt(0)).toBe(getChartColorAt(1000 * 0)); // stable
    // Wrap: finding period by matching color[0] again at positive offset
    let period = 1;
    while (getChartColorAt(period) !== getChartColorAt(0) && period < 200) {
      period++;
    }
    expect(getChartColorAt(period)).toBe(getChartColorAt(0));
    expect(getChartColorAt(period + 1)).toBe(getChartColorAt(1));
  });
});
