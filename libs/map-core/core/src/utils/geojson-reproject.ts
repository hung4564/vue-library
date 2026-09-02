import type { GeoJSON, Geometry, Position } from 'geojson';
import proj4 from 'proj4';
import { MapError } from '../errors';
import { errorHandler } from '../services/error-handler.service';
import {
  normalizeEpsgCode,
  resolveCrsProjection,
} from './crs-catalog';

type Proj4Fn = (
  from: string,
  to: string,
  coordinates: [number, number],
) => [number, number];

const proj4Fn = proj4 as unknown as Proj4Fn;

function transformPosition(
  from: string,
  to: string,
  position: Position,
): Position {
  const [x, y, ...rest] = position;
  const [lng, lat] = proj4Fn(from, to, [x, y]);
  return rest.length ? [lng, lat, ...rest] : [lng, lat];
}

function transformCoordinates(
  from: string,
  to: string,
  coordinates: number[] | number[][] | number[][][] | number[][][][],
): typeof coordinates {
  if (typeof coordinates[0] === 'number') {
    return transformPosition(from, to, coordinates as Position);
  }

  return (coordinates as number[][]).map((part) =>
    transformCoordinates(from, to, part as number[] | number[][] | number[][][]),
  ) as typeof coordinates;
}

function transformGeometry(
  geometry: Geometry,
  from: string,
  to: string,
): Geometry {
  if (geometry.type === 'GeometryCollection') {
    return {
      ...geometry,
      geometries: geometry.geometries.map((item) =>
        transformGeometry(item, from, to),
      ),
    };
  }

  if (!('coordinates' in geometry)) {
    return geometry;
  }

  return {
    ...geometry,
    coordinates: transformCoordinates(from, to, geometry.coordinates),
  } as Geometry;
}

export function toPlainJson<T>(value: T): T {
  if (value == null || typeof value !== 'object') return value;
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}

export function reprojectGeojsonToWgs84(
  geojson: GeoJSON,
  fromCrs: string | null | undefined,
): GeoJSON {
  const epsg = normalizeEpsgCode(fromCrs) ?? '4326';
  if (epsg === '4326') return geojson;

  const from = resolveCrsProjection(epsg);
  const to = 'EPSG:4326';

  try {
    const clone = toPlainJson(geojson);

    if (clone.type === 'FeatureCollection') {
      return {
        ...clone,
        features: clone.features.map((feature) => ({
          ...feature,
          geometry: feature.geometry
            ? transformGeometry(feature.geometry, from, to)
            : feature.geometry,
        })),
      };
    }

    if (clone.type === 'Feature') {
      return {
        ...clone,
        geometry: clone.geometry
          ? transformGeometry(clone.geometry, from, to)
          : clone.geometry,
      };
    }

    return transformGeometry(clone as Geometry, from, to) as GeoJSON;
  } catch (error) {
    errorHandler.handle(
      new MapError('GeoJSON reprojection failed', 'CRS_ERROR', {
        recoverable: false,
        cause: error,
        context: { epsg, from },
      }),
    );
    throw error;
  }
}
