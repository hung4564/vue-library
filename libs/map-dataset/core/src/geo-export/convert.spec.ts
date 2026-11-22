import type { FeatureCollection } from 'geojson';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { convertFeatureCollectionToFile } from './convert';

const fc: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: '1',
      properties: { name: 'A' },
      geometry: { type: 'Point', coordinates: [0, 0] },
    },
  ],
};

describe('convertFeatureCollectionToFile', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doUnmock('tokml');
    vi.doUnmock('@mapbox/shp-write');
  });

  it('builds a GeoJSON blob', async () => {
    const blob = await convertFeatureCollectionToFile(fc, 'geojson');
    expect(blob.type).toBe('application/geo+json');
    const text = await blob.text();
    expect(JSON.parse(text).features).toHaveLength(1);
  });

  it('builds a CSV blob with geometry column', async () => {
    const blob = await convertFeatureCollectionToFile(fc, 'csv');
    expect(blob.type).toBe('text/csv');
    const text = await blob.text();
    expect(text).toContain('name');
    expect(text).toContain('geometry');
    expect(text).toContain('A');
  });

  it('throws a clear peer hint when tokml cannot be loaded', async () => {
    vi.doMock('tokml', () => {
      throw new Error('Cannot find module');
    });
    const { convertFeatureCollectionToFile: convert } =
      await import('./convert');
    await expect(convert(fc, 'kml')).rejects.toThrow(
      'Install optional peer "tokml" to export KML',
    );
  });

  it('throws a clear peer hint when @mapbox/shp-write cannot be loaded', async () => {
    vi.doMock('@mapbox/shp-write', () => {
      throw new Error('Cannot find module');
    });
    const { convertFeatureCollectionToFile: convert } =
      await import('./convert');
    await expect(convert(fc, 'shapefile')).rejects.toThrow(
      'Install optional peer "@mapbox/shp-write" to export Shapefile',
    );
  });
});
