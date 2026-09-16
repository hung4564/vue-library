import { afterEach, describe, expect, it } from 'vitest';
import {
  edgeLabelRotation,
  formatAreaText,
  formatDistanceText,
  getMeasurementAreaUnit,
  getMeasurementDistanceUnit,
  setMeasurementAreaUnit,
  setMeasurementDistanceUnit,
} from './utils';

describe('measurement formatters', () => {
  afterEach(() => {
    setMeasurementDistanceUnit('auto');
    setMeasurementAreaUnit('auto');
  });

  it('formatDistanceText switches m/km at 1 km', () => {
    expect(formatDistanceText(0.5, 'en')).toContain('m');
    expect(formatDistanceText(1.5, 'en')).toContain('km');
  });

  it('formatAreaText switches m²/km² at 1e6 m²', () => {
    expect(formatAreaText(500, 'en')).toContain('m');
    expect(formatAreaText(2_000_000, 'en')).toContain('km');
  });

  it('respects preferred distance units', () => {
    setMeasurementDistanceUnit('ft');
    expect(getMeasurementDistanceUnit()).toBe('ft');
    expect(formatDistanceText(1, 'en')).toContain('ft');
    setMeasurementDistanceUnit('mi');
    expect(formatDistanceText(1, 'en')).toContain('mi');
    setMeasurementDistanceUnit('m');
    expect(formatDistanceText(1, 'en')).toContain('m');
  });

  it('respects preferred area units', () => {
    setMeasurementAreaUnit('ha');
    expect(getMeasurementAreaUnit()).toBe('ha');
    expect(formatAreaText(10_000, 'en')).toContain('ha');
    setMeasurementAreaUnit('acre');
    expect(formatAreaText(4046.8564224, 'en')).toContain('ac');
    setMeasurementAreaUnit('km2');
    expect(formatAreaText(1_000_000, 'en')).toContain('km');
  });

  it('edgeLabelRotation aligns text baseline with the edge', () => {
    // Horizontal east edge → text stays near 0° (baseline already along edge)
    expect(edgeLabelRotation([0, 0], [1, 0])).toBeCloseTo(0, 5);
    // Vertical north edge → text rotated ~±90° to follow the edge
    expect(Math.abs(edgeLabelRotation([0, 0], [0, 1]))).toBeCloseTo(90, 5);
  });
});
