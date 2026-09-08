import { describe, expect, it } from 'vitest';
import { asGisFeatureCollection, parseGisText } from './gis-parse';

describe('parseGisText', () => {
  it('parses GeoJSON FeatureCollection', () => {
    const text = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'A' },
          geometry: { type: 'Point', coordinates: [1, 2] },
        },
      ],
    });
    const result = parseGisText(text);
    expect(result.geojson?.type).toBe('FeatureCollection');
    expect(result.format).toBe('geojson');
    const fc = asGisFeatureCollection(result.geojson);
    expect(fc?.features).toHaveLength(1);
  });

  it('parses GeoJSONL', () => {
    const text = [
      JSON.stringify({
        type: 'Feature',
        properties: { id: 1 },
        geometry: { type: 'Point', coordinates: [0, 0] },
      }),
      JSON.stringify({
        type: 'Feature',
        properties: { id: 2 },
        geometry: { type: 'Point', coordinates: [1, 1] },
      }),
    ].join('\n');
    const result = parseGisText(text, { name: 'sample.geojsonl' });
    const fc = asGisFeatureCollection(result.geojson);
    expect(fc?.features.length).toBe(2);
  });

  it('parses WKT point', () => {
    const result = parseGisText('POINT (106.7 10.8)', { name: 'sample.wkt' });
    expect(result.geojson).toBeTruthy();
    const fc = asGisFeatureCollection(result.geojson);
    expect(fc?.features[0]?.geometry?.type).toBe('Point');
  });

  it('parses CSV with lat/lng columns', () => {
    const text = 'name,lat,lng\nA,10.8,106.7\nB,10.9,106.8\n';
    const result = parseGisText(text, { name: 'sample.csv' });
    const fc = asGisFeatureCollection(result.geojson);
    expect(fc?.features.length).toBe(2);
    expect(fc?.features[0]?.geometry?.type).toBe('Point');
  });

  it('returns null geojson for empty input', () => {
    const result = parseGisText('   ');
    expect(result.geojson).toBeNull();
  });

  it('returns null when strict is false and input is invalid', () => {
    const result = parseGisText('not-valid-gis{{{', { strict: false });
    expect(result.geojson).toBeNull();
  });
});
