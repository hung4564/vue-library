import type { GeoJSON } from 'geojson';
import type { LayerStyleType } from '../../utils/layer-simple-builder';

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

export function detectGeojsonStyleType(geojson: GeoJSON): LayerStyleType {
  const geometry = getFirstGeometryType(geojson);
  if (geometry === 'Point' || geometry === 'MultiPoint') return 'point';
  if (geometry === 'LineString' || geometry === 'MultiLineString') return 'line';
  return 'area';
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

function getFirstGeometryType(geojson: GeoJSON): string | undefined {
  if (geojson.type === 'Feature') {
    return geojson.geometry?.type;
  }
  if (geojson.type === 'FeatureCollection') {
    return geojson.features[0]?.geometry?.type;
  }
  if ('type' in geojson && 'coordinates' in geojson) {
    return geojson.type;
  }
  return undefined;
}
