import { describe, expect, it } from 'vitest';
import {
  degToDms,
  degToDmsString,
  dmsToDeg,
  isCoordinatesNumber,
  latDMS,
  lngDMS,
  toCoordinatesNumberList,
} from './coordinate';

describe('coordinate helpers', () => {
  it('filters complete coordinate pairs', () => {
    expect(isCoordinatesNumber([1, 2])).toBe(true);
    expect(isCoordinatesNumber([1, undefined as never])).toBe(false);
    expect(
      toCoordinatesNumberList([
        [1, 2],
        [3, undefined as never],
      ]),
    ).toEqual([[1, 2]]);
  });

  it('converts between degrees and DMS', () => {
    const dms = degToDms(21.5);
    expect(dms.deg).toBe(21);
    expect(dms.min).toBe(30);
    expect(Number(dmsToDeg(dms))).toBeCloseTo(21.5);
    expect(degToDmsString(21.5)).toContain('21');
    expect(latDMS(21)).toMatch(/N|S/);
    expect(lngDMS(105)).toMatch(/E|W/);
  });
});
