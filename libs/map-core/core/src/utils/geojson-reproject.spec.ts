import { describe, expect, it } from 'vitest';
import {
  isCallStackOverflow,
  reprojectGeojsonToWgs84,
  toPlainJson,
} from './geojson-reproject';

describe('geojson-reproject', () => {
  it('isCallStackOverflow detects overflow messages', () => {
    expect(
      isCallStackOverflow(new RangeError('Maximum call stack size exceeded')),
    ).toBe(true);
    expect(isCallStackOverflow(new Error('other'))).toBe(false);
  });

  it('toPlainJson clones plain objects', () => {
    const input = { a: 1, nested: { b: 2 } };
    const out = toPlainJson(input);
    expect(out).toEqual(input);
    expect(out).not.toBe(input);
  });

  it('reprojectGeojsonToWgs84 returns same geojson for EPSG:4326', () => {
    const geojson = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [105, 21] },
    } as const;
    const out = reprojectGeojsonToWgs84(geojson as never, '4326');
    expect(out.type).toBe('Feature');
    if (out.type === 'Feature' && out.geometry?.type === 'Point') {
      expect(out.geometry.coordinates[0]).toBeCloseTo(105);
      expect(out.geometry.coordinates[1]).toBeCloseTo(21);
    }
  });
});
