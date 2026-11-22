import type { FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';

import {
  attributeTableIdentifyRowSelectKey,
  buildAttributeTable,
  resolveAttributeTableSelectedRowIds,
} from './model';

describe('attribute table select keys', () => {
  it('uses stamped _id suffix (not geometry) when features lack business id', () => {
    const fc: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'f:0',
          properties: { _id: 'f:0', name: 'A' },
          geometry: { type: 'Point', coordinates: [10, 20] },
        },
        {
          type: 'Feature',
          id: 'f:1',
          properties: { _id: 'f:1', name: 'B' },
          geometry: { type: 'Point', coordinates: [30, 40] },
        },
      ],
    };
    const { rows } = buildAttributeTable(fc);
    expect(rows[0]?.id).toBe('0:f:0');
    expect(rows[1]?.id).toBe('1:f:1');
  });

  it('does not map Identify query-local index 0 to the first dataset row', () => {
    const fc: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'f:0',
          properties: { _id: 'f:0', name: 'FarAway' },
          geometry: { type: 'Point', coordinates: [0, 0] },
        },
        {
          type: 'Feature',
          id: 'f:1',
          properties: { _id: 'f:1', name: 'Hit' },
          geometry: { type: 'Point', coordinates: [105.8, 21.0] },
        },
      ],
    };
    const { rows } = buildAttributeTable(fc);
    expect(resolveAttributeTableSelectedRowIds(['0'], rows)).toEqual([]);
    expect(resolveAttributeTableSelectedRowIds(['1'], rows)).toEqual([]);

    const hitKey = attributeTableIdentifyRowSelectKey({
      id: 0,
      data: {
        _id: 'f:1',
        name: 'Hit',
        geometry: { type: 'Point', coordinates: [105.8, 21.0] },
      },
    });
    expect(hitKey).toBe('f:1');
    expect(resolveAttributeTableSelectedRowIds([hitKey], rows)).toEqual([
      '1:f:1',
    ]);
  });

  it('ignores MapLibre numeric feature.id without _id', () => {
    const hitKey = attributeTableIdentifyRowSelectKey({
      id: 42,
      data: {
        id: 42,
        name: 'Hit',
        geometry: { type: 'Point', coordinates: [105.8, 21.0] },
      },
    });
    expect(hitKey).toBe('');
  });

  it('still prefers real properties.id when present', () => {
    const fc: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { id: 'city-a', name: 'A' },
          geometry: { type: 'Point', coordinates: [10, 20] },
        },
        {
          type: 'Feature',
          properties: { id: 'city-b', name: 'B' },
          geometry: { type: 'Point', coordinates: [30, 40] },
        },
      ],
    };
    const { rows } = buildAttributeTable(fc);
    const hitKey = attributeTableIdentifyRowSelectKey({
      id: 'city-b',
      data: {
        id: 'city-b',
        name: 'B',
        geometry: { type: 'Point', coordinates: [30, 40] },
      },
    });
    expect(hitKey).toBe('city-b');
    expect(resolveAttributeTableSelectedRowIds([hitKey], rows)).toEqual([
      '1:city-b',
    ]);
  });

  it('prefers stamped _id over drifted MapLibre geometry', () => {
    const fc: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'f:1',
          properties: { _id: 'f:1', name: 'Hit' },
          geometry: { type: 'Point', coordinates: [105.8, 21.0] },
        },
      ],
    };
    const { rows } = buildAttributeTable(fc);
    const hitKey = attributeTableIdentifyRowSelectKey({
      id: 'f:1',
      data: {
        _id: 'f:1',
        name: 'Hit',
        geometry: {
          type: 'Point',
          coordinates: [105.80012, 21.00009],
        },
      },
    });
    expect(hitKey).toBe('f:1');
    expect(resolveAttributeTableSelectedRowIds([hitKey], rows)).toEqual([
      '0:f:1',
    ]);
  });
});
