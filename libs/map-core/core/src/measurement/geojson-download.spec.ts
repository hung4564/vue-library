import { describe, expect, it } from 'vitest';

import {
  buildMeasurementGeojsonDownload,
  draftCoordinatesToFeature,
} from './geojson-download';

describe('measurement geojson download helpers', () => {
  it('draftCoordinatesToFeature builds point / line / polygon', () => {
    expect(draftCoordinatesToFeature([[1, 2]])).toMatchObject({
      geometry: { type: 'Point', coordinates: [1, 2] },
    });
    expect(
      draftCoordinatesToFeature([
        [0, 0],
        [1, 1],
      ]),
    ).toMatchObject({
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1],
        ],
      },
    });
    expect(
      draftCoordinatesToFeature([
        [0, 0],
        [1, 0],
        [1, 1],
      ]),
    ).toMatchObject({
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 0],
          ],
        ],
      },
    });
  });

  it('draftCoordinatesToFeature skips null drafts and empty lists', () => {
    expect(draftCoordinatesToFeature([])).toBeUndefined();
    expect(draftCoordinatesToFeature([[null, null]])).toBeUndefined();
    expect(
      draftCoordinatesToFeature([
        [null, null],
        [2, 3],
      ]),
    ).toMatchObject({
      geometry: { type: 'Point', coordinates: [2, 3] },
    });
  });

  it('buildMeasurementGeojsonDownload returns blob + fileName', async () => {
    const result = buildMeasurementGeojsonDownload([[10, 20]], 'out.json');
    expect(result?.fileName).toBe('out.json');
    expect(result?.blob.type).toBe('text/plain;charset=utf-8');
    const text = await result!.blob.text();
    expect(JSON.parse(text)).toEqual({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Point', coordinates: [10, 20] },
        },
      ],
    });
  });

  it('buildMeasurementGeojsonDownload returns undefined for empty input', () => {
    expect(buildMeasurementGeojsonDownload([])).toBeUndefined();
  });
});
