/**
 * Pure FileGDB / GeoJSON helpers (no gdal3.js) — safe for GIS worker + form create.
 */
import type { Feature } from 'geojson';

/** Keep features that have a drawable geometry (skip attribute-only rows). */
export function featuresWithGeometry(features: Feature[]): Feature[] {
  return features.filter(
    (feature) =>
      !!feature?.geometry &&
      typeof feature.geometry === 'object' &&
      typeof (feature.geometry as { type?: unknown }).type === 'string',
  );
}
