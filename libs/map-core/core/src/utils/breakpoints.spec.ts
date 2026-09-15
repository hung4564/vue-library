import { describe, expect, it } from 'vitest';
import {
  DEFAULT_MAP_BREAKPOINTS,
  mapBreakpointGreaterOrEqual,
  mapBreakpointSmallerOrEqual,
  resolveMapBreakpointFlags,
  resolveMapBreakpoints,
} from './breakpoints';

describe('map breakpoints', () => {
  it('resolves defaults', () => {
    expect(resolveMapBreakpoints()).toEqual(DEFAULT_MAP_BREAKPOINTS);
  });

  it('flags bands from width', () => {
    expect(resolveMapBreakpointFlags(320).isMobile).toBe(true);
    expect(resolveMapBreakpointFlags(640).isMobile).toBe(false);
    expect(resolveMapBreakpointFlags(640).isTablet).toBe(true);
    expect(resolveMapBreakpointFlags(1100).isLaptop).toBe(true);
    expect(resolveMapBreakpointFlags(1400).isDesktop).toBe(true);
  });

  it('compares thresholds', () => {
    expect(mapBreakpointSmallerOrEqual(640, 'tablet')).toBe(true);
    expect(mapBreakpointSmallerOrEqual(641, 'tablet')).toBe(false);
    expect(mapBreakpointGreaterOrEqual(1024, 'laptop')).toBe(true);
  });
});
