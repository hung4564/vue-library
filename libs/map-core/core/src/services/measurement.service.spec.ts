import { describe, expect, it } from 'vitest';
import { MeasurementService } from './measurement.service';

describe('MeasurementService', () => {
  it('calculateDistance returns km for LineString and 0 otherwise', () => {
    const line = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 0],
        ],
      },
    } as const;
    expect(MeasurementService.calculateDistance(line as any)).toBeGreaterThan(
      100,
    );
    expect(
      MeasurementService.calculateDistance({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [0, 0] },
      } as any),
    ).toBe(0);
  });

  it('calculateArea returns m² for Polygon and 0 otherwise', () => {
    const poly = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 0],
          ],
        ],
      },
    } as const;
    expect(MeasurementService.calculateArea(poly as any)).toBeGreaterThan(0);
    expect(
      MeasurementService.calculateArea({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [0, 0] },
      } as any),
    ).toBe(0);
  });

  it('formatMeasurement wires distance/area formatters', () => {
    const distance = MeasurementService.formatMeasurement(1.5, 'distance', 'en');
    const areaText = MeasurementService.formatMeasurement(2500, 'area', 'en');
    expect(distance.length).toBeGreaterThan(0);
    expect(areaText.length).toBeGreaterThan(0);
  });
});
