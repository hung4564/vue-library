/**
 * Framework-agnostic coordinate utilities
 * Provides functions for coordinate formatting and conversion
 */

import { type CoordinatesNumber, type DraftCoordinatesNumber } from '../types';

import { type CrsItem } from '../crs/types';
import { transformWgs84ToCrs } from './coordinate-proj4';

export { transformWgs84ToCrs } from './coordinate-proj4';

export function isCoordinatesNumber(
  value: DraftCoordinatesNumber | null | undefined,
): value is CoordinatesNumber {
  return (
    Array.isArray(value) &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  );
}

export function toCoordinatesNumberList(
  coords: DraftCoordinatesNumber[] = [],
): CoordinatesNumber[] {
  return coords.filter(isCoordinatesNumber);
}

/**
 * Formatted coordinate point
 */
export interface FormattedCoordinate {
  longitude: string;
  latitude: string;
}

/**
 * DMS (Degrees, Minutes, Seconds) representation
 */
export interface DMS {
  deg: number;
  min: number;
  sec: number;
}

/**
 * Formats coordinates based on CRS and DMS settings.
 * Transforms WGS84 → target CRS via proj4 when needed.
 */
export function formatCoordinate(
  { longitude, latitude }: { longitude: number; latitude: number },
  crs?: CrsItem,
  isDMS = false,
  precision?: number | null,
): FormattedCoordinate {
  const currentPoint: FormattedCoordinate = { longitude: '0', latitude: '0' };
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return currentPoint;
  }

  let transformedLng = longitude;
  let transformedLat = latitude;
  let didTransform = !crs || !!crs.default || crs.epsg === '4326';

  if (crs && !crs.default && crs.epsg !== '4326') {
    const transformed = transformWgs84ToCrs(longitude, latitude, crs);
    if (transformed) {
      [transformedLng, transformedLat] = transformed;
      didTransform = true;
    }
  }

  // Only apply meter rounding after a successful projected transform.
  // Otherwise untransformed lon/lat become nonsense like "105, 22" for EPSG:3857.
  const useMeter = !!crs && crs.unit === 'meter' && didTransform;

  const formatNumber = (value: number) => {
    if (precision === null) return String(value);
    if (typeof precision === 'number') return value.toFixed(precision);
    if (useMeter) return value.toFixed(0);
    return value.toFixed(6);
  };

  if (useMeter) {
    currentPoint.longitude = formatNumber(transformedLng);
    currentPoint.latitude = formatNumber(transformedLat);
  } else if (isDMS) {
    currentPoint.longitude = lngDMS(+transformedLng);
    currentPoint.latitude = latDMS(+transformedLat);
  } else {
    currentPoint.longitude = formatNumber(transformedLng);
    currentPoint.latitude = formatNumber(transformedLat);
  }

  return currentPoint;
}

/**
 * Converts decimal degrees to DMS (Degrees, Minutes, Seconds)
 *
 * @param deg - Decimal degrees
 * @returns DMS object with degrees, minutes, and seconds
 */
export function degToDms(deg: number): DMS {
  let d = Math.floor(deg);
  const minFloat = (deg - d) * 60;
  let m = Math.floor(minFloat);
  const secFloat = (minFloat - m) * 60;
  let s = Math.round(secFloat);

  // After rounding, the seconds might become 60
  if (s == 60) {
    m++;
    s = 0;
  }
  if (m == 60) {
    d++;
    m = 0;
  }

  return { deg: d, min: m, sec: s };
}

/**
 * Converts DMS (Degrees, Minutes, Seconds) to decimal degrees
 *
 * @param dms - DMS object with degrees, minutes, and seconds
 * @returns Decimal degrees as a string with 6 decimal places
 */
export function dmsToDeg(
  { deg, min, sec }: { deg: number; min: number; sec: number } = {
    deg: 0,
    min: 0,
    sec: 0,
  },
): string {
  const result = (Number(deg) + Number(min) / 60 + Number(sec) / 3600).toFixed(
    6,
  );
  return result;
}

/**
 * Converts decimal degrees to DMS string format
 *
 * @param deg - Decimal degrees
 * @returns DMS string in format "deg° min′ sec″"
 */
export function degToDmsString(deg: number): string {
  const { deg: d, min: m, sec: s } = degToDms(deg);

  return (
    d +
    '° ' +
    (m + '').padStart(2, '0') +
    '′ ' +
    (s + '').padStart(2, '0') +
    '″'
  );
}

/**
 * Formats latitude as DMS string with cardinal direction
 *
 * @param lat - Latitude in decimal degrees
 * @returns DMS string with N/S suffix
 */
export function latDMS(lat: number): string {
  return `${dcToDeg(lat)}° ${dcToMin(lat)}' ${parseFloat(
    dcToSec(lat).toFixed(2),
  )}" ${lat > 0 ? 'N' : 'S'}`;
}

/**
 * Formats longitude as DMS string with cardinal direction
 *
 * @param lng - Longitude in decimal degrees
 * @returns DMS string with E/W suffix
 */
export function lngDMS(lng: number): string {
  return `${dcToDeg(lng)}° ${dcToMin(lng)}' ${parseFloat(
    dcToSec(lng).toFixed(2),
  )}" ${lng > 0 ? 'E' : 'W'}`;
}

/**
 * Helper: Extract degrees from decimal
 */
function dcToDeg(val: number): number {
  if (val === 0) {
    return 0;
  }
  return Math.floor(Math.abs(val));
}

/**
 * Helper: Extract minutes from decimal
 */
function dcToMin(val: number): number {
  if (val === 0) {
    return 0;
  }
  return Math.floor((Math.abs(val) - Math.floor(Math.abs(val))) * 60);
}

/**
 * Helper: Extract seconds from decimal
 */
function dcToSec(val: number): number {
  if (val === 0) {
    return 0;
  }
  return (Math.abs(val) - dcToDeg(val) - dcToMin(val) / 60) * 3600;
}

export type ParsedCoordinateText = {
  lng: number;
  lat: number;
  zoom?: number;
};

function parseDmsToken(token: string): number | null {
  const cleaned = token.trim().replace(/,/g, '');
  if (!cleaned) return null;
  const hemi = cleaned.match(/[NnSsEeWw]/)?.[0];
  const nums = cleaned.match(/-?\d+(?:\.\d+)?/g);
  if (!nums?.length) return null;
  const deg = Number(nums[0]);
  const min = nums[1] != null ? Number(nums[1]) : 0;
  const sec = nums[2] != null ? Number(nums[2]) : 0;
  if ([deg, min, sec].some((n) => Number.isNaN(n))) return null;
  let value = dmsToDeg({ deg: Math.abs(deg), min, sec });
  if (deg < 0) value = -value;
  if (hemi && /[SsWw]/.test(hemi)) value = -Math.abs(value);
  if (hemi && /[NnEe]/.test(hemi)) value = Math.abs(value);
  return value;
}

/**
 * Parse pasted coordinate text into lng/lat (and optional zoom).
 * Supports decimal pairs, Google Maps `lat,lng,Nz`, and simple DMS with N/S/E/W.
 */
export function parseCoordinateText(text: string): ParsedCoordinateText | null {
  const raw = text.trim();
  if (!raw) return null;

  // Google Maps clipboard / URL: "20.99,105.84,21z" or "@20.99,105.84,21z"
  // Also "lat,lng,zoom" without trailing z (e.g. "20.73,106.30,8.96")
  const google = raw.match(
    /@?\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)(z)?\b/i,
  );
  if (google) {
    const a = Number(google[1]);
    const b = Number(google[2]);
    const zoom = Number(google[3]);
    const hasZ = Boolean(google[4]);
    // With "z": always lat,lng,zoom. Without "z": only if third looks like a zoom level.
    const zoomOk =
      !Number.isNaN(zoom) &&
      (hasZ || (zoom >= 0 && zoom <= 24));
    if (
      zoomOk &&
      !Number.isNaN(a) &&
      !Number.isNaN(b) &&
      Math.abs(a) <= 90 &&
      Math.abs(b) <= 180
    ) {
      return {
        lat: a,
        lng: b,
        zoom,
      };
    }
  }

  // Labeled zoom ("zoom 12" / "z:12") or bare trailing ",12z" already handled above
  const labeledZoom = raw.match(
    /(?:^|[\s,;])(?:zoom)\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i,
  );
  const zoom =
    labeledZoom != null && !Number.isNaN(Number(labeledZoom[1]))
      ? Number(labeledZoom[1])
      : undefined;

  const withoutZoom = raw
    .replace(/@?\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*-?\d+(?:\.\d+)?z\b/i, '$1, $2')
    .replace(/(?:^|[\s,;])(?:zoom)\s*[:=]?\s*-?\d+(?:\.\d+)?/i, ' ')
    .replace(/^@\s*/, '')
    .trim();

  // Decimal pair: "lng, lat" or "lng lat"
  const decimal = withoutZoom.match(
    /^\s*(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*$/,
  );
  if (decimal) {
    const a = Number(decimal[1]);
    const b = Number(decimal[2]);
    if (Number.isNaN(a) || Number.isNaN(b)) return null;
    // Prefer lng,lat; if first looks like latitude-only range and second like lng, swap.
    let lng = a;
    let lat = b;
    if (Math.abs(a) <= 90 && Math.abs(b) > 90 && Math.abs(b) <= 180) {
      lat = a;
      lng = b;
    }
    if (Math.abs(lng) > 180 || Math.abs(lat) > 90) return null;
    return {
      lng,
      lat,
      zoom,
    };
  }

  // DMS pair split on comma / semicolon / "and"
  const parts = withoutZoom.split(/\s*[,;]\s*|\s+and\s+/i).filter(Boolean);
  if (parts.length >= 2) {
    const first = parseDmsToken(parts[0]);
    const second = parseDmsToken(parts[1]);
    if (first == null || second == null) return null;
    let lng = first;
    let lat = second;
    const firstHemi = parts[0].match(/[NnSsEeWw]/)?.[0];
    if (firstHemi && /[NnSs]/.test(firstHemi)) {
      lat = first;
      lng = second;
    } else if (Math.abs(first) <= 90 && Math.abs(second) > 90 && Math.abs(second) <= 180) {
      lat = first;
      lng = second;
    }
    if (Math.abs(lng) > 180 || Math.abs(lat) > 90) return null;
    return {
      lng,
      lat,
      zoom,
    };
  }

  return null;
}

/**
 * Parse multi-line / CSV paste into lng/lat pairs.
 * One coordinate pair per line (comma, semicolon, or tab). Skips header rows.
 */
export function parseCoordinateListText(text: string): CoordinatesNumber[] {
  const raw = text.replace(/^\uFEFF/, '').trim();
  if (!raw) return [];

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  // Single-line paste: reuse the richer single-pair parser (Google z, DMS, …).
  if (lines.length === 1) {
    const one = parseCoordinateText(lines[0]);
    return one ? [[one.lng, one.lat]] : [];
  }

  const coords: CoordinatesNumber[] = [];
  for (const line of lines) {
    if (
      /^(lng|lon|long|longitude|x)\s*[,;\t]\s*(lat|latitude|y)\b/i.test(line) ||
      /^(lat|latitude|y)\s*[,;\t]\s*(lng|lon|long|longitude|x)\b/i.test(line)
    ) {
      continue;
    }

    const parsed = parseCoordinateText(line);
    if (parsed) {
      coords.push([parsed.lng, parsed.lat]);
      continue;
    }

    // CSV row with extra columns: take the first two numeric fields.
    const cells = line.split(/[,;\t]/).map((c) => c.trim());
    if (cells.length < 2) continue;
    const a = Number(cells[0]);
    const b = Number(cells[1]);
    if (Number.isNaN(a) || Number.isNaN(b)) continue;
    let lng = a;
    let lat = b;
    if (Math.abs(a) <= 90 && Math.abs(b) > 90 && Math.abs(b) <= 180) {
      lat = a;
      lng = b;
    }
    if (Math.abs(lng) > 180 || Math.abs(lat) > 90) continue;
    coords.push([lng, lat]);
  }

  return coords;
}
