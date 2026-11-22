import proj4 from 'proj4';

import {
  ensureRegisteredProjection,
  WGS84_LONGLAT,
} from '../crs/proj4-crs-catalog';
import type { CrsItem } from '../crs/types';
import { MapError } from '../errors';
import { errorHandler } from '../services/error-handler.service';

function resolveDestProjection(crs: CrsItem): string | undefined {
  const fromItem = crs.proj4js?.trim();
  if (fromItem?.startsWith('+')) return fromItem;
  return ensureRegisteredProjection(crs.epsg);
}

/**
 * Transform WGS84 lon/lat → target CRS. Returns null when transform is unavailable.
 */
export function transformWgs84ToCrs(
  longitude: number,
  latitude: number,
  crs: CrsItem,
): [number, number] | null {
  if (crs.default || crs.epsg === '4326') return [longitude, latitude];
  const dest = resolveDestProjection(crs);
  if (!dest) return null;

  try {
    const result = proj4(WGS84_LONGLAT, dest, [longitude, latitude]);
    if (Array.isArray(result) && result.length >= 2) {
      const x = Number(result[0]);
      const y = Number(result[1]);
      if (Number.isFinite(x) && Number.isFinite(y)) return [x, y];
    }
  } catch (error) {
    errorHandler.handle(
      new MapError('proj4 transformation failed', 'CRS_ERROR', {
        recoverable: true,
        cause: error,
        context: { epsg: crs.epsg },
      }),
    );
  }
  return null;
}
