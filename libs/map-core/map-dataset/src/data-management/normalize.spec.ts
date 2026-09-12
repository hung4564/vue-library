import { describe, expect, it } from 'vitest';
import {
  normalizeInitData,
  pickGeometry,
  toFeature,
  toFeatureCollection,
  toRecord,
} from './normalize';

describe('normalize', () => {
  it('converts a GeoJSON Feature to a record', () => {
    const record = toRecord({
      type: 'Feature',
      id: '1',
      properties: { name: 'a' },
      geometry: { type: 'Point', coordinates: [105, 21] },
    });
    expect(record).toEqual({
      id: '1',
      name: 'a',
      geometry: { type: 'Point', coordinates: [105, 21] },
    });
  });

  it('picks geom / geo fields from list rows', () => {
    expect(
      pickGeometry({
        id: 1,
        geom: { type: 'Point', coordinates: [1, 2] },
      }),
    ).toEqual({ type: 'Point', coordinates: [1, 2] });

    const fromGeo = toRecord({
      id: 2,
      name: 'b',
      geo: JSON.stringify({ type: 'Point', coordinates: [3, 4] }),
    });
    expect(fromGeo?.geometry).toEqual({ type: 'Point', coordinates: [3, 4] });
    expect(fromGeo?.geo).toBeUndefined();
  });

  it('allows missing id', () => {
    const record = toRecord({
      name: 'no-id',
      geometry: { type: 'Point', coordinates: [0, 0] },
    });
    expect(record?.id).toBeUndefined();
    expect(record?.name).toBe('no-id');
  });

  it('round-trips record to feature collection', () => {
    const records = normalizeInitData([
      {
        id: 1,
        name: 'x',
        geometry: { type: 'Point', coordinates: [1, 2] },
      },
    ]);
    const fc = toFeatureCollection(records);
    expect(fc.features).toHaveLength(1);
    expect(toFeature(records[0])?.properties).toMatchObject({
      id: 1,
      name: 'x',
    });
  });

  it('normalizes FeatureCollection init data', () => {
    const records = normalizeInitData(
      {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { id: 'a', title: 'A' },
            geometry: { type: 'Point', coordinates: [0, 0] },
          },
        ],
      },
      { format: 'feature-collection' },
    );
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe('a');
    expect(records[0].title).toBe('A');
  });
});
