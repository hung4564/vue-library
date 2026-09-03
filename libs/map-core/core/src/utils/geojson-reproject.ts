import type { Feature, GeoJSON, Geometry, Position } from 'geojson';
import proj4 from 'proj4';
import { MapError } from '../errors';
import { errorHandler } from '../services/error-handler.service';
import { normalizeEpsgCode, resolveCrsProjection } from './crs-catalog';
import { WGS84_LONGLAT } from './proj4-crs-catalog';

const COORDINATE_MAX_DEPTH = 6;
const GEOMETRY_MAX_DEPTH = 16;
const CLONE_MAX_DEPTH = 64;

const DATA_SIZE_HINT =
  'data may be too large, too deeply nested, or contain circular references. Try a smaller file or data already in EPSG:4326.';

type ForwardFn = (position: Position) => Position;

type Proj4Converter = {
  forward: (xy: [number, number]) => [number, number];
};

type Proj4Lib = {
  (from: string, to: string): Proj4Converter;
};

const proj4Lib = proj4 as unknown as Proj4Lib;

function readFlag(value: object, key: string): unknown {
  try {
    return (value as Record<string, unknown>)[key];
  } catch {
    return undefined;
  }
}

function unwrapVueRaw<T>(value: T): T {
  let current: unknown = value;
  for (let i = 0; i < 8; i += 1) {
    if (!current || typeof current !== 'object') return current as T;
    const raw = readFlag(current, '__v_raw');
    if (!raw || raw === current) return current as T;
    current = raw;
  }
  return current as T;
}

/** True for "Maximum call stack size exceeded" (not every RangeError). */
export function isCallStackOverflow(error: unknown): boolean {
  const raw = error instanceof Error ? error.message : String(error ?? '');
  return /call stack size exceeded/i.test(raw);
}

/** Lightweight GeoJSON size/type info — does not deep-walk coordinates. */
function describeGeojson(geojson: unknown): {
  type?: string;
  featureCount?: number;
} {
  if (!geojson || typeof geojson !== 'object') return {};
  const value = geojson as GeoJSON;
  if (value.type === 'FeatureCollection' && Array.isArray(value.features)) {
    return { type: value.type, featureCount: value.features.length };
  }
  if (value.type === 'Feature') {
    return { type: value.type, featureCount: 1 };
  }
  if ('type' in value && typeof value.type === 'string') {
    return { type: value.type, featureCount: 1 };
  }
  return {};
}

function wrapCloneError(error: unknown, value?: unknown): MapError {
  if (error instanceof MapError) {
    error.setContext({
      stage: 'clone',
      ...describeGeojson(value),
      ...error.context,
    });
    return error;
  }

  const stackOverflow = isCallStackOverflow(error);
  const reason = stackOverflow
    ? 'too_deep_or_circular_or_large'
    : 'clone_failed';
  const message = stackOverflow
    ? `Could not clone GeoJSON: ${DATA_SIZE_HINT}`
    : 'Could not clone GeoJSON';

  return new MapError(message, 'CRS_ERROR', {
    recoverable: false,
    cause: error,
    context: {
      stage: 'clone',
      reason,
      ...describeGeojson(value),
    },
  });
}

/**
 * Iterative deep clone — avoids call-stack overflow from recursive
 * `JSON.stringify` / `.map` on awkward Proxy trees.
 */
function cloneJsonValueIterative(root: unknown): unknown {
  if (root == null || typeof root !== 'object') return root;

  const seen = new WeakMap<object, unknown>();
  type Frame = {
    source: object;
    target: Record<string, unknown> | unknown[];
    keys: Array<string | number>;
    index: number;
  };

  const rootUnwrapped = unwrapVueRaw(root);
  if (rootUnwrapped == null || typeof rootUnwrapped !== 'object') {
    return rootUnwrapped;
  }

  const createTarget = (source: object): Record<string, unknown> | unknown[] => {
    if (ArrayBuffer.isView(source) && !(source instanceof DataView)) {
      return Array.from(source as unknown as ArrayLike<number>);
    }
    return Array.isArray(source) ? [] : {};
  };

  const rootTarget = createTarget(rootUnwrapped);
  if (
    Array.isArray(rootTarget) &&
    ArrayBuffer.isView(rootUnwrapped) &&
    !(rootUnwrapped instanceof DataView)
  ) {
    return rootTarget;
  }

  seen.set(rootUnwrapped, rootTarget);
  const stack: Frame[] = [
    {
      source: rootUnwrapped,
      target: rootTarget,
      keys: Array.isArray(rootUnwrapped)
        ? rootUnwrapped.map((_, i) => i)
        : Object.keys(rootUnwrapped as Record<string, unknown>).filter(
            (key) =>
              typeof (rootUnwrapped as Record<string, unknown>)[key] !==
              'function',
          ),
      index: 0,
    },
  ];

  while (stack.length) {
    if (stack.length > CLONE_MAX_DEPTH) {
      throw new MapError(
        `GeoJSON is too deeply nested: ${DATA_SIZE_HINT}`,
        'CRS_ERROR',
        {
          recoverable: false,
          context: {
            stage: 'clone',
            reason: 'too_deep_or_circular_or_large',
            maxDepth: CLONE_MAX_DEPTH,
          },
        },
      );
    }

    const frame = stack[stack.length - 1];
    if (frame.index >= frame.keys.length) {
      stack.pop();
      continue;
    }

    const key = frame.keys[frame.index++];
    const rawNested = Array.isArray(frame.source)
      ? frame.source[key as number]
      : (frame.source as Record<string, unknown>)[key as string];

    if (rawNested == null || typeof rawNested !== 'object') {
      if (Array.isArray(frame.target)) {
        frame.target[key as number] = rawNested;
      } else {
        frame.target[key as string] = rawNested;
      }
      continue;
    }

    const nested = unwrapVueRaw(rawNested);
    if (nested == null || typeof nested !== 'object') {
      if (Array.isArray(frame.target)) {
        frame.target[key as number] = nested;
      } else {
        frame.target[key as string] = nested;
      }
      continue;
    }

    const existing = seen.get(nested);
    if (existing !== undefined) {
      throw new MapError(
        `GeoJSON contains circular references: ${DATA_SIZE_HINT}`,
        'CRS_ERROR',
        {
          recoverable: false,
          context: {
            stage: 'clone',
            reason: 'too_deep_or_circular_or_large',
          },
        },
      );
    }

    if (ArrayBuffer.isView(nested) && !(nested instanceof DataView)) {
      const copied = Array.from(nested as unknown as ArrayLike<number>);
      seen.set(nested, copied);
      if (Array.isArray(frame.target)) {
        frame.target[key as number] = copied;
      } else {
        frame.target[key as string] = copied;
      }
      continue;
    }

    const childTarget = createTarget(nested);
    seen.set(nested, childTarget);
    if (Array.isArray(frame.target)) {
      frame.target[key as number] = childTarget;
    } else {
      frame.target[key as string] = childTarget;
    }

    stack.push({
      source: nested,
      target: childTarget,
      keys: Array.isArray(nested)
        ? nested.map((_, i) => i)
        : Object.keys(nested as Record<string, unknown>).filter(
            (childKey) =>
              typeof (nested as Record<string, unknown>)[childKey] !==
              'function',
          ),
      index: 0,
    });
  }

  return rootTarget;
}

/**
 * Deep-clone JSON-like data. GeoJSON uses a shape-aware path (safe for Vue
 * proxies). Other values use iterative clone.
 */
export function toPlainJson<T>(value: T): T {
  if (value == null || typeof value !== 'object') return value;

  try {
    const unwrapped = unwrapVueRaw(value);
    if (looksLikeGeojson(unwrapped)) {
      return toPlainGeojson(unwrapped as GeoJSON) as T;
    }
    return cloneJsonValueIterative(unwrapped) as T;
  } catch (error) {
    throw wrapCloneError(error, value);
  }
}

function looksLikeGeojson(value: unknown): value is GeoJSON {
  if (!value || typeof value !== 'object' || !('type' in value)) return false;
  const type = (value as { type?: unknown }).type;
  return (
    type === 'FeatureCollection' ||
    type === 'Feature' ||
    type === 'Point' ||
    type === 'MultiPoint' ||
    type === 'LineString' ||
    type === 'MultiLineString' ||
    type === 'Polygon' ||
    type === 'MultiPolygon' ||
    type === 'GeometryCollection'
  );
}

function cloneJsonArray(value: unknown, depth = 0): unknown {
  if (depth > CLONE_MAX_DEPTH) {
    throw new MapError(
      `GeoJSON is too deeply nested: ${DATA_SIZE_HINT}`,
      'CRS_ERROR',
      {
        recoverable: false,
        context: {
          stage: 'clone',
          reason: 'too_deep_or_circular_or_large',
          maxDepth: CLONE_MAX_DEPTH,
        },
      },
    );
  }
  if (value == null || typeof value !== 'object') return value;
  const raw = unwrapVueRaw(value);
  if (!Array.isArray(raw)) return raw;
  const out = new Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    const item = raw[i];
    out[i] =
      item != null && typeof item === 'object'
        ? cloneJsonArray(item, depth + 1)
        : item;
  }
  return out;
}

function plainProperties(
  properties: unknown,
): Record<string, unknown> | null {
  if (properties == null) return null;
  const raw = unwrapVueRaw(properties);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(raw as Record<string, unknown>)) {
    const value = (raw as Record<string, unknown>)[key];
    if (typeof value === 'function') continue;
    if (value != null && typeof value === 'object') {
      try {
        out[key] = JSON.parse(JSON.stringify(unwrapVueRaw(value)));
      } catch {
        // Skip non-serializable property values rather than failing the layer.
      }
      continue;
    }
    out[key] = value;
  }
  return out;
}

function plainGeometry(geometry: unknown, depth = 0): Geometry | null {
  if (geometry == null) return null;
  if (depth > GEOMETRY_MAX_DEPTH) {
    throw new MapError('GeoJSON geometry is too deeply nested', 'CRS_ERROR', {
      recoverable: false,
      context: { stage: 'clone', reason: 'too_deep_or_circular_or_large' },
    });
  }
  const raw = unwrapVueRaw(geometry) as Geometry;
  if (!raw || typeof raw !== 'object' || !('type' in raw)) return null;

  if (raw.type === 'GeometryCollection') {
    return {
      type: 'GeometryCollection',
      geometries: (raw.geometries ?? [])
        .map((item) => plainGeometry(item, depth + 1))
        .filter((item): item is Geometry => !!item),
    };
  }

  if (!('coordinates' in raw)) return raw;
  return {
    type: raw.type,
    coordinates: cloneJsonArray(raw.coordinates) as never,
  } as Geometry;
}

function plainFeature(feature: unknown): Feature {
  const raw = unwrapVueRaw(feature) as Feature;
  const out: Feature = {
    type: 'Feature',
    properties: plainProperties(raw?.properties),
    geometry: plainGeometry(raw?.geometry),
  };
  if (raw && 'id' in raw && raw.id !== undefined) out.id = raw.id;
  return out;
}

/** Shape-aware GeoJSON clone — does not walk arbitrary object graphs. */
function toPlainGeojson(geojson: GeoJSON): GeoJSON {
  const raw = unwrapVueRaw(geojson) as GeoJSON;
  if (!raw || typeof raw !== 'object') {
    throw new MapError('Invalid GeoJSON', 'CRS_ERROR', { recoverable: false });
  }

  if (raw.type === 'FeatureCollection') {
    const features = Array.isArray(raw.features) ? raw.features : [];
    return {
      type: 'FeatureCollection',
      features: features.map((feature) => plainFeature(feature)),
    };
  }
  if (raw.type === 'Feature') {
    return plainFeature(raw);
  }
  return plainGeometry(raw) as GeoJSON;
}

function createForward(from: string, to: string): ForwardFn {
  if (typeof from !== 'string' || typeof to !== 'string') {
    throw new MapError('Invalid CRS projection', 'CRS_ERROR', {
      recoverable: false,
    });
  }
  if (!from.startsWith('+') || !to.startsWith('+')) {
    throw new MapError(
      `CRS must be a proj4 string (${from} → ${to})`,
      'CRS_ERROR',
      { recoverable: false },
    );
  }

  let converter: Proj4Converter;
  try {
    converter = proj4Lib(from, to);
  } catch (error) {
    throw new MapError(`Cannot transform ${from} → ${to}`, 'CRS_ERROR', {
      recoverable: false,
      cause: error,
    });
  }
  if (!converter || typeof converter.forward !== 'function') {
    throw new MapError(`Cannot transform ${from} → ${to}`, 'CRS_ERROR', {
      recoverable: false,
    });
  }

  return (position: Position): Position => {
    if (!Array.isArray(position) || typeof position[0] !== 'number') {
      throw new MapError('Invalid GeoJSON position', 'CRS_ERROR', {
        recoverable: false,
      });
    }
    const x = Number(position[0]);
    const y = Number(position[1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return position;
    try {
      const [lng, lat] = converter.forward([x, y]);
      return position.length > 2 ? [lng, lat, ...position.slice(2)] : [lng, lat];
    } catch (error) {
      throw new MapError(
        isCallStackOverflow(error)
          ? `CRS transform overflow (${from} → ${to}). Check the projection definition and coordinates.`
          : `CRS transform failed (${from} → ${to})`,
        'CRS_ERROR',
        { recoverable: false, cause: error },
      );
    }
  };
}

function transformCoordinates(
  forward: ForwardFn,
  coordinates: unknown,
  depth = 0,
): Position | Position[] | Position[][] | Position[][][] {
  if (depth > COORDINATE_MAX_DEPTH) {
    throw new MapError('GeoJSON coordinates are too deeply nested', 'CRS_ERROR', {
      recoverable: false,
    });
  }
  if (!Array.isArray(coordinates)) {
    throw new MapError('Invalid GeoJSON coordinates', 'CRS_ERROR', {
      recoverable: false,
    });
  }
  if (coordinates.length === 0) return [];
  if (typeof coordinates[0] === 'number') {
    return forward(coordinates as Position);
  }
  if (!Array.isArray(coordinates[0])) {
    throw new MapError('Invalid GeoJSON coordinates', 'CRS_ERROR', {
      recoverable: false,
    });
  }
  return coordinates.map((part) =>
    transformCoordinates(forward, part, depth + 1),
  ) as Position[];
}

function transformGeometry(
  geometry: Geometry,
  forward: ForwardFn,
  depth = 0,
): Geometry {
  if (depth > GEOMETRY_MAX_DEPTH) {
    throw new MapError('GeoJSON geometry is too deeply nested', 'CRS_ERROR', {
      recoverable: false,
    });
  }
  if (geometry.type === 'GeometryCollection') {
    return {
      ...geometry,
      geometries: geometry.geometries.map((item) =>
        transformGeometry(item, forward, depth + 1),
      ),
    };
  }

  if (!('coordinates' in geometry)) {
    return geometry;
  }

  return {
    ...geometry,
    coordinates: transformCoordinates(forward, geometry.coordinates),
  } as Geometry;
}

function wrapReprojectError(
  error: unknown,
  epsg: string,
  from: string,
  geojson?: GeoJSON,
): MapError {
  const desc = describeGeojson(geojson);
  const asMap =
    error instanceof MapError
      ? error
      : error &&
          typeof error === 'object' &&
          (error as Error).name === 'MapError' &&
          typeof (error as { code?: unknown }).code === 'string'
        ? (error as MapError)
        : null;
  if (asMap) {
    asMap.setContext({
      epsg,
      from,
      stage: asMap.context?.['stage'] ?? 'reproject',
      ...desc,
    });
    return asMap;
  }
  const raw = error instanceof Error ? error.message : String(error);
  const stackOverflow = isCallStackOverflow(error);
  const message = stackOverflow
    ? `Failed to reproject EPSG:${epsg} → WGS84: projection/clone overflow. Confirm CRS definition and try EPSG:4326 data.`
    : raw || 'GeoJSON reprojection failed';
  return new MapError(message, 'CRS_ERROR', {
    recoverable: false,
    cause: error,
    context: {
      epsg,
      from,
      stage: 'reproject',
      reason: stackOverflow ? 'call_stack_overflow' : 'reproject_failed',
      ...desc,
    },
  });
}

export type ReprojectProgress = (current: number, total: number) => void;

export function reprojectGeojsonToWgs84(
  geojson: GeoJSON,
  fromCrs: string | null | undefined,
  onProgress?: ReprojectProgress,
): GeoJSON {
  const epsg = normalizeEpsgCode(fromCrs) ?? '4326';
  if (epsg === '4326') return geojson;

  const from = resolveCrsProjection(epsg);
  const to = WGS84_LONGLAT;

  try {
    const clone = toPlainJson(geojson);
    const forward = createForward(from, to);

    if (clone.type === 'FeatureCollection') {
      const total = clone.features.length;
      const features = new Array(total);
      onProgress?.(0, total);
      for (let i = 0; i < total; i++) {
        const feature = clone.features[i];
        features[i] = {
          ...feature,
          geometry: feature.geometry
            ? transformGeometry(feature.geometry, forward)
            : feature.geometry,
        };
        onProgress?.(i + 1, total);
      }
      return { ...clone, features };
    }

    if (clone.type === 'Feature') {
      onProgress?.(0, 1);
      const result = {
        ...clone,
        geometry: clone.geometry
          ? transformGeometry(clone.geometry, forward)
          : clone.geometry,
      };
      onProgress?.(1, 1);
      return result;
    }

    onProgress?.(0, 1);
    const geometry = transformGeometry(clone as Geometry, forward) as GeoJSON;
    onProgress?.(1, 1);
    return geometry;
  } catch (error) {
    const wrapped = wrapReprojectError(error, epsg, from, geojson);
    if (typeof window !== 'undefined') {
      try {
        errorHandler.handleOnce(wrapped);
      } catch {
        // Listener/log failures must not hide the reprojection error.
      }
    }
    throw wrapped;
  }
}
