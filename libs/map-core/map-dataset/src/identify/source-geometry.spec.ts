import type { FeatureCollection } from 'geojson';
import type { MapGeoJSONFeature } from 'maplibre-gl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GEOJSON_FEATURE_ID_KEY } from '../geojson/feature-id';
import * as findSource from '../geojson/find-source';
import {
  coerceIdentifyResolvedFeature,
  findSourceFeatureByMatchIds,
  flattenIdentifyFeatureData,
  identifyRenderedFeatureMatchIds,
  resolveIdentifyFeatureData,
  resolveIdentifyFeatures,
} from './source-geometry';

const sourceFc: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'f:0',
      properties: { [GEOJSON_FEATURE_ID_KEY]: 'f:0', name: 'Hanoi' },
      geometry: { type: 'Point', coordinates: [105.85, 21.03] },
    },
  ],
};

const skewedRendered = {
  id: 'f:0',
  properties: { [GEOJSON_FEATURE_ID_KEY]: 'f:0', name: 'Hanoi' },
  geometry: { type: 'Point', coordinates: [106.0, 21.5] },
} as MapGeoJSONFeature;

const sourceView = {
  type: 'source' as const,
  getMapboxSource: () => ({ type: 'geojson', data: sourceFc }),
  getData: () => sourceFc,
};

function mockSource(getFeature?: ReturnType<typeof vi.fn>) {
  vi.spyOn(findSource, 'findGeojsonSource').mockReturnValue(
    sourceView as never,
  );
  return getFeature;
}

describe('identify source geometry', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('matches rendered hit to source by _id (not skewed MapLibre coords)', () => {
    const ids = identifyRenderedFeatureMatchIds(
      skewedRendered,
      GEOJSON_FEATURE_ID_KEY,
    );
    expect(ids).toContain('f:0');

    const source = findSourceFeatureByMatchIds(
      sourceFc,
      ids,
      GEOJSON_FEATURE_ID_KEY,
    );
    expect(source?.geometry).toEqual({
      type: 'Point',
      coordinates: [105.85, 21.03],
    });

    const flat = flattenIdentifyFeatureData(skewedRendered, source);
    expect(flat.geometry).toEqual({
      type: 'Point',
      coordinates: [105.85, 21.03],
    });
    expect(flat.name).toBe('Hanoi');
  });

  it('falls back to rendered geometry when source has no match', () => {
    const rendered = {
      id: 'unknown',
      properties: { name: 'x' },
      geometry: { type: 'Point', coordinates: [1, 2] },
    } as MapGeoJSONFeature;
    const flat = flattenIdentifyFeatureData(rendered, undefined);
    expect(flat.geometry).toEqual({ type: 'Point', coordinates: [1, 2] });
  });

  it('coerceIdentifyResolvedFeature ignores records without geometry', () => {
    expect(coerceIdentifyResolvedFeature({ id: '1', name: 'a' })).toBeNull();
    expect(
      coerceIdentifyResolvedFeature({
        id: '1',
        geometry: { type: 'Point', coordinates: [0, 1] },
      })?.geometry,
    ).toEqual({ type: 'Point', coordinates: [0, 1] });
  });

  it('prefers Identify getFeature({ feature, source, id }) → Feature[]', async () => {
    const getFeature = vi.fn(async () => [
      {
        type: 'Feature' as const,
        id: 'f:0',
        properties: { [GEOJSON_FEATURE_ID_KEY]: 'f:0', name: 'ID' },
        geometry: { type: 'Point' as const, coordinates: [104.0, 20.0] },
      },
    ]);
    mockSource(getFeature);

    const flat = await resolveIdentifyFeatureData(
      {
        config: { field_id: GEOJSON_FEATURE_ID_KEY },
        getFeature,
      } as never,
      skewedRendered,
    );
    expect(getFeature).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'f:0',
        feature: skewedRendered,
        source: sourceView,
      }),
    );
    expect(flat.geometry).toEqual({
      type: 'Point',
      coordinates: [104.0, 20.0],
    });
    expect(flat.name).toBe('ID');
  });

  it('falls back to source when getFeature returns null', async () => {
    const getFeature = vi.fn(async () => null);
    mockSource(getFeature);

    const flat = await resolveIdentifyFeatureData(
      {
        config: { field_id: GEOJSON_FEATURE_ID_KEY },
        getFeature,
      } as never,
      skewedRendered,
    );
    expect(flat.geometry).toEqual({
      type: 'Point',
      coordinates: [105.85, 21.03],
    });
  });

  it('multi-hit calls getFeature({ features, source, ids }) once → Feature[]', async () => {
    const skewed2 = {
      id: 'f:1',
      properties: { [GEOJSON_FEATURE_ID_KEY]: 'f:1', name: 'Hue' },
      geometry: { type: 'Point', coordinates: [108.0, 16.5] },
    } as MapGeoJSONFeature;
    const getFeature = vi.fn(async () => [
      {
        type: 'Feature' as const,
        id: 'f:0',
        properties: { [GEOJSON_FEATURE_ID_KEY]: 'f:0', name: 'G0' },
        geometry: { type: 'Point' as const, coordinates: [105.0, 21.0] },
      },
      {
        type: 'Feature' as const,
        id: 'f:1',
        properties: { [GEOJSON_FEATURE_ID_KEY]: 'f:1', name: 'G1' },
        geometry: { type: 'Point' as const, coordinates: [107.5, 16.4] },
      },
    ]);
    mockSource(getFeature);

    const features = await resolveIdentifyFeatures(
      {
        config: { field_id: GEOJSON_FEATURE_ID_KEY },
        getFeature,
      } as never,
      [skewedRendered, skewed2],
    );
    expect(getFeature).toHaveBeenCalledTimes(1);
    expect(getFeature).toHaveBeenCalledWith(
      expect.objectContaining({
        features: [skewedRendered, skewed2],
        ids: ['f:0', 'f:1'],
        source: sourceView,
      }),
    );
    expect(features).toHaveLength(2);
    expect(features[0].geometry).toEqual({
      type: 'Point',
      coordinates: [105.0, 21.0],
    });
    expect(features[1].geometry).toEqual({
      type: 'Point',
      coordinates: [107.5, 16.4],
    });
  });
});
