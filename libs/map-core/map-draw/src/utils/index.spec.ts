import { describe, expect, it } from 'vitest';
import type { Feature } from 'geojson';
import { getFeatureId, sameFeature } from './index';

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

  it('sameFeature matches across id vs properties.id with string coercion', () => {
    expect(sameFeature(point('1'), point(undefined, 1))).toBe(true);
    expect(sameFeature(point('a'), point('b'))).toBe(false);
    expect(sameFeature(point(undefined), point(undefined))).toBe(false);
  });
});
