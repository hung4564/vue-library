import type { MapGeoJSONFeature } from 'maplibre-gl';
import { describe, expect, it, vi } from 'vitest';

import { GEOJSON_FEATURE_ID_KEY } from '../geojson/feature-id';
import * as findSource from '../geojson/find-source';
import {
  buildIdentifyFeatureRows,
  dedupeRenderedFeaturesById,
  flatsToIdentifyFeatureRows,
  primaryIdentifyFeatureId,
  primaryIdentifyRowId,
} from './rows';

const hit = (
  props: Record<string, unknown>,
  id?: string | number,
): MapGeoJSONFeature =>
  ({
    id,
    properties: props,
    geometry: { type: 'Point', coordinates: [0, 0] },
  }) as MapGeoJSONFeature;

describe('identify rows / _id', () => {
  it('primaryIdentifyFeatureId prefers field_id then _id then feature.id', () => {
    expect(
      primaryIdentifyFeatureId(
        hit({ [GEOJSON_FEATURE_ID_KEY]: 'f:0', id: 'biz' }, 'ml'),
        'id',
      ),
    ).toBe('biz');
    expect(
      primaryIdentifyFeatureId(
        hit({ [GEOJSON_FEATURE_ID_KEY]: 'f:0' }, 'ml'),
        'id',
      ),
    ).toBe('f:0');
    expect(
      primaryIdentifyFeatureId(
        hit({ [GEOJSON_FEATURE_ID_KEY]: 'f:0' }, 'ml'),
        GEOJSON_FEATURE_ID_KEY,
      ),
    ).toBe('f:0');
    expect(primaryIdentifyFeatureId(hit({}, 'ml'), 'id')).toBe('ml');
  });

  it('dedupeRenderedFeaturesById keeps first hit per _id', () => {
    const a = hit({ [GEOJSON_FEATURE_ID_KEY]: 'f:0', name: 'a' });
    const b = hit({ [GEOJSON_FEATURE_ID_KEY]: 'f:0', name: 'b' });
    const c = hit({ [GEOJSON_FEATURE_ID_KEY]: 'f:1', name: 'c' });
    const out = dedupeRenderedFeaturesById([a, b, c], GEOJSON_FEATURE_ID_KEY);
    expect(out).toHaveLength(2);
    expect(out[0].properties?.name).toBe('a');
    expect(out[1].properties?.name).toBe('c');
  });

  it('flatsToIdentifyFeatureRows uses _id when field_id missing on flat', () => {
    const rows = flatsToIdentifyFeatureRows(
      [{ [GEOJSON_FEATURE_ID_KEY]: 'f:9', name: 'X', geometry: null }],
      'id',
      'name',
    );
    expect(rows[0].id).toBe('f:9');
    expect(
      primaryIdentifyRowId({ [GEOJSON_FEATURE_ID_KEY]: 'f:9' }, 'id'),
    ).toBe('f:9');
  });

  it('buildIdentifyFeatureRows uses getFeature → Feature[] after dedupe', async () => {
    vi.spyOn(findSource, 'findGeojsonSource').mockReturnValue(undefined);
    const getFeature = vi.fn(async () => [
      {
        type: 'Feature' as const,
        id: 'f:0',
        properties: { [GEOJSON_FEATURE_ID_KEY]: 'f:0', name: 'a' },
        geometry: { type: 'Point' as const, coordinates: [1, 2] },
      },
    ]);
    const identify = {
      config: { field_id: GEOJSON_FEATURE_ID_KEY, field_name: 'name' },
      getFeature,
    } as never;

    const a = hit({ [GEOJSON_FEATURE_ID_KEY]: 'f:0', name: 'a' });
    const dup = hit({ [GEOJSON_FEATURE_ID_KEY]: 'f:0', name: 'dup' });
    const rows = await buildIdentifyFeatureRows(identify, [a, dup]);
    expect(getFeature).toHaveBeenCalledTimes(1);
    expect(getFeature).toHaveBeenCalledWith(
      expect.objectContaining({
        feature: a,
        id: 'f:0',
      }),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe('f:0');
    expect(rows[0].data.geometry).toEqual({
      type: 'Point',
      coordinates: [1, 2],
    });
  });
});
