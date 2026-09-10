import { describe, expect, it, vi } from 'vitest';
import type { Feature } from 'geojson';
import type { MapSimple } from '@hungpvq/map-core';
import {
  getFeatureByMap,
  getFeatureId,
  getFirstFeatureByMap,
  sameFeature,
} from './index';

const point = (
  id: string | number | undefined,
  propsId?: string | number,
): Feature => ({
  type: 'Feature',
  ...(id != null ? { id } : {}),
  properties: propsId != null ? { id: propsId } : {},
  geometry: { type: 'Point', coordinates: [0, 0] },
});

describe('getFeatureId / sameFeature', () => {
  it('prefers feature.id over properties.id', () => {
    expect(getFeatureId(point('top', 'prop'))).toBe('top');
  });

  it('falls back to properties.id', () => {
    expect(getFeatureId(point(undefined, 'prop'))).toBe('prop');
  });

  it('returns undefined when neither is set', () => {
    expect(getFeatureId(point(undefined))).toBeUndefined();
  });

  it('coerces numeric ids via String in sameFeature', () => {
    expect(sameFeature(point(1), point('1'))).toBe(true);
    expect(sameFeature(point(2), point(undefined, '2'))).toBe(true);
  });

  it('sameFeature matches across id vs properties.id with string coercion', () => {
    expect(sameFeature(point('1'), point(undefined, 1))).toBe(true);
    expect(sameFeature(point('a'), point('b'))).toBe(false);
    expect(sameFeature(point(undefined), point(undefined))).toBe(false);
  });
});

describe('getFeatureByMap / getFirstFeatureByMap', () => {
  function mockMap(features: Feature[]): MapSimple {
    return {
      project: vi.fn(() => ({ x: 100, y: 200 })),
      queryRenderedFeatures: vi.fn(() => features),
    } as unknown as MapSimple;
  }

  it('queries a 10px box around the projected point', () => {
    const map = mockMap([point('a')]);
    const result = getFeatureByMap(map, [105, 21], ['layer-a']);
    expect(map.project).toHaveBeenCalledWith([105, 21]);
    expect(map.queryRenderedFeatures).toHaveBeenCalledWith(
      [
        [95, 195],
        [105, 205],
      ],
      { layers: ['layer-a'] },
    );
    expect(result).toHaveLength(1);
  });

  it('getFirstFeatureByMap returns first hit or undefined', () => {
    expect(
      getFirstFeatureByMap(mockMap([point('a'), point('b')]), [0, 0]),
    ).toEqual(point('a'));
    expect(getFirstFeatureByMap(mockMap([]), [0, 0])).toBeUndefined();
  });
});
