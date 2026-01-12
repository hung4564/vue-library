import type { LngLatBoundsLike } from 'maplibre-gl';
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

/**
 * Get bounding box from geometry/feature/collection
 */
function getBBox(
  feature: Geometry | Feature | FeatureCollection,
): LngLatBoundsLike | undefined {
  if (!feature) {
    return undefined;
  }

  let coordinates: CoordinatesNumber[] = [];

  if (feature.type === 'FeatureCollection') {
    coordinates = feature.features.flatMap((f) => {
      if (f.geometry.type === 'Point') {
        return [f.geometry.coordinates as CoordinatesNumber];
      }
      if (
        f.geometry.type === 'LineString' ||
        f.geometry.type === 'MultiPoint'
      ) {
        return f.geometry.coordinates as CoordinatesNumber[];
      }
      if (
        f.geometry.type === 'Polygon' ||
        f.geometry.type === 'MultiLineString'
      ) {
        return f.geometry.coordinates.flat() as CoordinatesNumber[];
      }
      if (f.geometry.type === 'MultiPolygon') {
        return f.geometry.coordinates.flat(2) as CoordinatesNumber[];
      }
      return [];
    });
  } else if (feature.type === 'Feature') {
    const geom = feature.geometry;
    if (geom.type === 'Point') {
      coordinates = [geom.coordinates as CoordinatesNumber];
    } else if (geom.type === 'LineString' || geom.type === 'MultiPoint') {
      coordinates = geom.coordinates as CoordinatesNumber[];
    } else if (geom.type === 'Polygon' || geom.type === 'MultiLineString') {
      coordinates = geom.coordinates.flat() as CoordinatesNumber[];
    } else if (geom.type === 'MultiPolygon') {
      coordinates = geom.coordinates.flat(2) as CoordinatesNumber[];
    }
  } else {
    const geom = feature;
    if (geom.type === 'Point') {
      coordinates = [geom.coordinates as CoordinatesNumber];
    } else if (geom.type === 'LineString' || geom.type === 'MultiPoint') {
      coordinates = geom.coordinates as CoordinatesNumber[];
    } else if (geom.type === 'Polygon' || geom.type === 'MultiLineString') {
      coordinates = geom.coordinates.flat() as CoordinatesNumber[];
    } else if (geom.type === 'MultiPolygon') {
      coordinates = geom.coordinates.flat(2) as CoordinatesNumber[];
    }
  }

  if (coordinates.length === 0) {
    return undefined;
  }

  const lngs = coordinates.map((c) => c[0]);
  const lats = coordinates.map((c) => c[1]);

  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
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
