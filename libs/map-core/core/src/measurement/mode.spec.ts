import { describe, expect, it } from 'vitest';

import {
  resolveMeasurementModeToggle,
  resolveMeasurementToolbarStatus,
} from './mode';

describe('measurement mode helpers', () => {
  it('resolveMeasurementToolbarStatus', () => {
    expect(resolveMeasurementToolbarStatus(undefined)).toBe('select');
    expect(resolveMeasurementToolbarStatus('distance')).toBe('handle');
  });

  it('resolveMeasurementModeToggle clears same type', () => {
    expect(resolveMeasurementModeToggle('distance', 'distance')).toEqual({
      start: false,
      nextType: undefined,
    });
  });

  it('resolveMeasurementModeToggle starts a new type', () => {
    expect(resolveMeasurementModeToggle(undefined, 'area')).toEqual({
      start: true,
      nextType: 'area',
    });
    expect(resolveMeasurementModeToggle('distance', 'area')).toEqual({
      start: true,
      nextType: 'area',
    });
  });
});
