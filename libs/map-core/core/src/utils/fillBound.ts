import type { LngLatBoundsLike } from 'maplibre-gl';
import { bbox as turfBbox } from '@turf/turf';
import type {
  CoordinatesNumber,
  Feature,
  FeatureCollection,
  Geometry,
  MapSimple,
} from '../types';

/**
 * Fit bounds value type
 */
type FitBoundsValue =
  | LngLatBoundsLike
  | [CoordinatesNumber, CoordinatesNumber]
  | Geometry
  | Feature
  | FeatureCollection
  | CoordinatesNumber[]
  | null;

/**
 * Fit bounds options
 */
export interface FitBoundsOptions {
  zoom?: number;
}

export type GeojsonBbox = [number, number, number, number];

/**
 * Fit bounds to map
 */
export function fitBounds(
  map: MapSimple,
  value: FitBoundsValue,
  { zoom = 15 }: FitBoundsOptions = {},
) {
  if (!map || !value) {
    return;
  }

  let bounds: LngLatBoundsLike | undefined;

  if (
    Array.isArray(value) &&
    value.length === 2 &&
    Array.isArray(value[0]) &&
    Array.isArray(value[1])
  ) {
    // [lng, lat] pair format
    bounds = [value[0] as [number, number], value[1] as [number, number]];
  } else if (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'number'
  ) {
    // Coordinates array format
    bounds = getBBox(convertGeometry(value as CoordinatesNumber[]));
  } else if (
    typeof value === 'object' &&
    'type' in value &&
    ('coordinates' in value || 'geometry' in value || 'features' in value)
  ) {
    // GeoJSON format
    bounds = getBBox(value as Geometry | Feature | FeatureCollection);
  } else if (
    Array.isArray(value) &&
    value.length === 2 &&
    (Array.isArray(value[0]) || typeof value[0] === 'number')
  ) {
    // LngLatBoundsLike format
    bounds = value as LngLatBoundsLike;
  }

  if (bounds) {
    map.fitBounds(bounds, {
      padding: 50,
      duration: 0,
      maxZoom: zoom,
    });
  }
}

function isValidTurfBbox(box: number[]): box is GeojsonBbox {
  return (
    box.length === 4 &&
    box.every((n) => typeof n === 'number' && Number.isFinite(n))
  );
}

/**
 * GeoJSON bbox `[minLng, minLat, maxLng, maxLat]` via Turf, or undefined if empty.
 */
export function bboxFromGeojson(
  feature: Geometry | Feature | FeatureCollection,
): GeojsonBbox | undefined {
  if (!feature) return undefined;
  try {
    const box = turfBbox(feature as never);
    if (!isValidTurfBbox(box)) return undefined;
    return [box[0], box[1], box[2], box[3]];
  } catch {
    return undefined;
  }
}

/**
 * Get bounding box as MapLibre `[[sw], [ne]]`.
 */
function getBBox(
  feature: Geometry | Feature | FeatureCollection,
): LngLatBoundsLike | undefined {
  const box = bboxFromGeojson(feature);
  if (!box) return undefined;
  return [
    [box[0], box[1]],
    [box[2], box[3]],
  ];
}

/**
 * Convert coordinates to geometry
 */
export function convertGeometry(
  coordinates: CoordinatesNumber[],
  properties: Record<string, unknown> = {},
): Feature {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: coordinates,
    },
    properties,
  };
}
