import type { GeoJSON } from 'geojson';
import type { LayerStyleType } from '../../utils/layer-simple-builder';

/** Style mode: fixed layer type, or auto-detect all types in the data. */
export const GEOJSON_STYLE_AUTO = 'auto' as const;
export type GeojsonStyleMode = LayerStyleType | typeof GEOJSON_STYLE_AUTO;

/** Feature count above this uses the GIS worker for style-type / bbox work. */
const GIS_WORKER_FEATURE_THRESHOLD = 2_000;

export function isValidGeojson(value: unknown): value is GeoJSON {
  if (!value || typeof value !== 'object') return false;
  const typed = value as GeoJSON;
  if (
    typed.type === 'Feature' ||
    typed.type === 'FeatureCollection' ||
    ('type' in typed && 'coordinates' in typed)
  ) {
    return true;
  }
  return false;
}

export function parseGeojsonText(text: string): GeoJSON | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return isValidGeojson(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function parseGeojsonData(raw: unknown): GeoJSON | null {
  if (!raw) return null;
  if (typeof raw === 'string') return parseGeojsonText(raw);
  return isValidGeojson(raw) ? raw : null;
}

const STYLE_TYPE_ORDER: LayerStyleType[] = ['area', 'line', 'point'];

function geometryTypeToStyleType(
  geometryType: string | undefined,
): LayerStyleType | undefined {
  if (!geometryType) return undefined;
  if (geometryType === 'Point' || geometryType === 'MultiPoint') return 'point';
  if (
    geometryType === 'LineString' ||
    geometryType === 'MultiLineString'
  ) {
    return 'line';
  }
  if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
    return 'area';
  }
  return undefined;
}

function collectGeometryTypes(
  geometry: GeoJSON | null | undefined,
  into: Set<string>,
): void {
  if (!geometry || typeof geometry !== 'object' || !('type' in geometry)) {
    return;
  }
  if (geometry.type === 'GeometryCollection') {
    for (const child of geometry.geometries ?? []) {
      collectGeometryTypes(child as GeoJSON, into);
    }
    return;
  }
  if (geometry.type === 'Feature') {
    collectGeometryTypes(geometry.geometry as GeoJSON | null, into);
    return;
  }
  if (geometry.type === 'FeatureCollection') {
    for (const feature of geometry.features ?? []) {
      collectGeometryTypes(feature as GeoJSON, into);
    }
    return;
  }
  into.add(geometry.type);
}

/** Lightweight feature count (FeatureCollection length only). */
function estimateGeojsonFeatureCount(geojson: GeoJSON): number {
  if (geojson.type === 'FeatureCollection') return geojson.features.length;
  if (geojson.type === 'Feature') return 1;
  return 1;
}

/** True when style detect / bbox should prefer the GIS worker. */
export function shouldUseGisWorkerForGeojson(geojson: GeoJSON): boolean {
  return estimateGeojsonFeatureCount(geojson) >= GIS_WORKER_FEATURE_THRESHOLD;
}

/** All style types present in the GeoJSON (area → line → point for paint order). */
export function detectGeojsonStyleTypes(geojson: GeoJSON): LayerStyleType[] {
  const geometryTypes = new Set<string>();
  collectGeometryTypes(geojson, geometryTypes);

  const styles = new Set<LayerStyleType>();
  for (const geometryType of geometryTypes) {
    const style = geometryTypeToStyleType(geometryType);
    if (style) styles.add(style);
  }

  const ordered = STYLE_TYPE_ORDER.filter((style) => styles.has(style));
  return ordered.length ? ordered : ['point'];
}

/** First / primary style type (backward compatible). */
export function detectGeojsonStyleType(geojson: GeoJSON): LayerStyleType {
  return detectGeojsonStyleTypes(geojson)[0] ?? 'point';
}

export function isGeojsonStyleAuto(
  type: string | null | undefined,
): type is typeof GEOJSON_STYLE_AUTO {
  return type === GEOJSON_STYLE_AUTO;
}

/** Mapbox `$type` filter value for a layer style. */
export function styleTypeToMapboxGeometryType(
  style: LayerStyleType,
): 'Point' | 'LineString' | 'Polygon' | undefined {
  if (style === 'point') return 'Point';
  if (style === 'line') return 'LineString';
  if (style === 'area') return 'Polygon';
  return undefined;
}

export function detectGeojsonCrs(geojson: GeoJSON): string | null {
  const raw = geojson as GeoJSON & {
    crs?: { properties?: { name?: string } };
  };
  const name = raw.crs?.properties?.name;
  if (!name) return null;
  const match = String(name).match(/EPSG[:\s]*(\d+)/i);
  return match?.[1] ?? null;
}
