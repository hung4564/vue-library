import { normalizeEpsgCode } from '@hungpvq/map-core/crs';
import type { FeatureCollection } from 'geojson';
import { detectGeojsonCrs } from '../geojson/geojson-parse';
import { reprojectGeojsonAsync } from '../geojson/geojson-worker.client';

/** Default EPSG when source/target CRS is omitted (map data is WGS 84). */
export const GEO_EXPORT_DEFAULT_CRS = '4326';

export type ResolveGeoExportCrsOptions = {
  sourceCrs?: string | null;
  targetCrs?: string | null;
  collection?: FeatureCollection | null;
};

export type ResolvedGeoExportCrs = {
  sourceCrs: string;
  targetCrs: string;
};

export function resolveGeoExportCrs(
  options: ResolveGeoExportCrsOptions = {},
): ResolvedGeoExportCrs {
  const detected = options.collection
    ? detectGeojsonCrs(options.collection)
    : null;
  const sourceCrs =
    normalizeEpsgCode(options.sourceCrs) ??
    normalizeEpsgCode(detected) ??
    GEO_EXPORT_DEFAULT_CRS;
  const targetCrs =
    normalizeEpsgCode(options.targetCrs) ?? sourceCrs;
  return { sourceCrs, targetCrs };
}

/**
 * Reproject a FeatureCollection for download when target CRS differs from source.
 * No-op when codes match.
 */
export async function reprojectFeatureCollectionForExport(
  collection: FeatureCollection,
  options: Pick<ResolveGeoExportCrsOptions, 'sourceCrs' | 'targetCrs'> = {},
): Promise<FeatureCollection> {
  const { sourceCrs, targetCrs } = resolveGeoExportCrs({
    ...options,
    collection,
  });
  if (sourceCrs === targetCrs) return collection;
  const geojson = await reprojectGeojsonAsync(collection, sourceCrs, targetCrs);
  return geojson as FeatureCollection;
}
