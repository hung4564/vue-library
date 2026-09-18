import { describe, expect, it } from 'vitest';
import {
  ATTRIBUTE_TABLE_ROW_HEIGHT,
  getVirtualRowWindow,
} from './virtual-rows';

describe('getVirtualRowWindow', () => {
  it('returns empty window for zero rows', () => {
    expect(getVirtualRowWindow(0, 0, 200, ATTRIBUTE_TABLE_ROW_HEIGHT)).toEqual({
      start: 0,
      end: 0,
      offsetY: 0,
      totalHeight: 0,
    });
  });

  it('windows rows with overscan around scrollTop', () => {
    const rowHeight = 10;
    const win = getVirtualRowWindow(100, 50, 40, rowHeight, 2);
    expect(win.totalHeight).toBe(1000);
    expect(win.start).toBe(3); // floor(50/10)-2
    expect(win.end).toBe(Math.min(100, 3 + Math.ceil(40 / 10) + 4));
    expect(win.offsetY).toBe(win.start * rowHeight);
  });
});
