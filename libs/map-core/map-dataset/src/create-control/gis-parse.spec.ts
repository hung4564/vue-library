import { describe, expect, it } from 'vitest';
import {
  asGisFeatureCollection,
  parseGisText,
  parseGisTextAsync,
} from './gis-parse';

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

  it('returns null geojson for empty input', () => {
    const result = parseGisText('   ');
    expect(result.geojson).toBeNull();
  });

  it('returns null when strict is false and input is invalid', () => {
    const result = parseGisText('not-valid-gis{{{', { strict: false });
    expect(result.geojson).toBeNull();
  });

  it('throws when strict is true and input is invalid', () => {
    expect(() =>
      parseGisText('not-valid-gis{{{', { strict: true }),
    ).toThrow(/Unsupported or invalid GIS data/);
  });

  it('throws by default (strict) on invalid GeoJSON object', () => {
    expect(() =>
      parseGisText(JSON.stringify({ type: 'NotAFeature', properties: {} })),
    ).toThrow(/Unsupported or invalid GIS data/);
  });

  it('throws on invalid WKT when named as .wkt', () => {
    expect(() =>
      parseGisText('NOT_A_WKT (1 2)', { name: 'broken.wkt', strict: true }),
    ).toThrow();
  });

  it('throws on truncated GeoJSONL line', () => {
    const text = [
      JSON.stringify({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [0, 0] },
      }),
      '{broken-json',
    ].join('\n');
    expect(() =>
      parseGisText(text, { name: 'sample.geojsonl', strict: true }),
    ).toThrow();
  });

  it('rejects CSV on sync path (use parseGisTextAsync)', () => {
    const text = 'name,lat,lng\nA,10.8,106.7\n';
    expect(() => parseGisText(text, { name: 'sample.csv' })).toThrow(
      /parseGisTextAsync/,
    );
  });
});

describe('parseGisTextAsync', () => {
  it('parses CSV with lat/lng columns', async () => {
    const text = 'name,lat,lng\nA,10.8,106.7\nB,10.9,106.8\n';
    const result = await parseGisTextAsync(text, { name: 'sample.csv' });
    const fc = asGisFeatureCollection(result.geojson);
    expect(fc?.features.length).toBe(2);
    expect(fc?.features[0]?.geometry?.type).toBe('Point');
  });

  it('returns null when strict is false and CSV is invalid', async () => {
    const result = await parseGisTextAsync('not,csv,at,all\n???', {
      name: 'bad.csv',
      strict: false,
    });
    expect(result.geojson).toBeNull();
  });

  it('throws when strict is true and text is invalid', async () => {
    await expect(
      parseGisTextAsync('not-valid-gis{{{', { strict: true }),
    ).rejects.toThrow(/Unsupported or invalid GIS data/);
  });
});
