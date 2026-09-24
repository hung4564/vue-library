import type { Feature, FeatureCollection, GeoJSON } from 'geojson';
import { describe, expect, it } from 'vitest';

import { ensureGeojsonFeatureIds, GEOJSON_FEATURE_ID_KEY } from './feature-id';

describe('ensureGeojsonFeatureIds', () => {
  it('stamps _id and feature.id when missing (world-cities shape)', () => {
    const input: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Bombo', sov_a3: 'UGA' },
          geometry: { type: 'Point', coordinates: [32.5333, 0.5833] },
        },
        {
          type: 'Feature',
          properties: { name: 'Potenza', sov_a3: 'ITA' },
          geometry: { type: 'Point', coordinates: [15.799, 40.642] },
        },
      ],
    };
    const out = ensureGeojsonFeatureIds(input) as FeatureCollection;
    expect(out.features[0]?.id).toBe('f:0');
    expect(out.features[0]?.properties?.[GEOJSON_FEATURE_ID_KEY]).toBe('f:0');
    expect(out.features[1]?.id).toBe('f:1');
    expect(out.features[1]?.properties?.[GEOJSON_FEATURE_ID_KEY]).toBe('f:1');
  });

  it('keeps existing properties.id / feature.id', () => {
    const input: Feature = {
      type: 'Feature',
      id: 'city-a',
      properties: { id: 'city-a', name: 'A' },
      geometry: { type: 'Point', coordinates: [1, 2] },
    };
    const out = ensureGeojsonFeatureIds(input) as Feature;
    expect(out.id).toBe('city-a');
    expect(out.properties?.[GEOJSON_FEATURE_ID_KEY]).toBe('city-a');
  });

  it('is a no-op for GeometryCollection roots', () => {
    const geom: GeoJSON = {
      type: 'GeometryCollection',
      geometries: [],
    };
    expect(ensureGeojsonFeatureIds(geom)).toBe(geom);
  });
});
