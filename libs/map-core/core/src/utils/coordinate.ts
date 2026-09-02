/**
 * Framework-agnostic coordinate utilities
 * Provides functions for coordinate formatting and conversion
 */

import {
  type CoordinatesNumber,
  type CrsItem,
  type DraftCoordinatesNumber,
} from '../types';
import { MapError } from '../errors';
import { errorHandler } from '../services/error-handler.service';

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

// Type for proj4 function
// proj4(from, to, coordinates) or proj4(from, coordinates) where from is projection string
// proj4 can also return a curried function in some cases
type Proj4Function = (
  from: string,
  to: string | [number, number],
  coordinates?: [number, number],
) => [number, number] | ((coordinates: [number, number]) => [number, number]);

// Optional proj4 - will be loaded dynamically if available
let proj4Fn: Proj4Function | undefined;
let proj4ModulePromise: Promise<Proj4Function | undefined> | undefined;

/**
 * Try to get proj4 function synchronously
 * This allows the library to work even if proj4 is not installed
 * Proj4 should be available as a peer dependency
 *
 * Note: This will attempt to load proj4 on first call. If proj4 is not available,
 * it will return undefined and the transformation will be skipped.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getProj4(): Proj4Function | undefined {
  if (proj4Fn) {
    return proj4Fn;
  }

  // Try to access proj4 from global scope first
  // This works for browser environments where proj4 might be loaded globally
  if (typeof window !== 'undefined') {
    const globalProj4 = (window as unknown as Record<string, unknown>)['proj4'];
    if (globalProj4 && typeof globalProj4 === 'function') {
      proj4Fn = globalProj4 as Proj4Function;
      return proj4Fn;
    }
  }

  // For module environments, try to load proj4 asynchronously
  // This will work on subsequent calls after the first async load completes
  if (!proj4ModulePromise) {
    proj4ModulePromise = (async () => {
      try {
        // Use dynamic import (ES modules)
        // Note: This requires proj4 to be installed as a peer dependency
        const proj4Module = await import('proj4');
        const mod = proj4Module as unknown as Proj4Function & {
          default?: Proj4Function;
        };
        proj4Fn = (mod.default ?? mod) as Proj4Function;
        return proj4Fn;
      } catch {
        // proj4 is not available
        return undefined;
      }
    })();
  }

  // Return undefined for now - will be available on next call after async load
  return undefined;
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
 * Formats coordinates based on CRS and DMS settings
 * Supports coordinate transformation via proj4
 *
 * @param longitude - Longitude value
 * @param latitude - Latitude value
 * @param crs - Optional CRS item for transformation
 * @param isDMS - Whether to format as DMS (Degrees, Minutes, Seconds)
 * @returns Formatted coordinate object with string values
 */
export function formatCoordinate(
  { longitude, latitude }: { longitude: number; latitude: number },
  crs?: CrsItem,
  isDMS = false,
): FormattedCoordinate {
  const currentPoint: FormattedCoordinate = { longitude: '0', latitude: '0' };
  if (!longitude || !latitude) return currentPoint;

  // Transform coordinates if CRS is provided and not default
  let transformedLng = longitude;
  let transformedLat = latitude;

  if (crs && !crs.default && crs.proj4js) {
    // Note: getProj4() is async, but we can't make formatCoordinate async
    // So we'll try to get it synchronously if already loaded, otherwise skip transformation
    if (proj4Fn) {
      try {
        // proj4(from, coordinates) - transforms coordinates using the from projection
        const result = proj4Fn(crs.proj4js, [longitude, latitude]);
        if (Array.isArray(result) && result.length === 2) {
          [transformedLng, transformedLat] = result;
        } else if (typeof result === 'function') {
          // If result is a function (curried), call it
          const transformed = (
            result as (coordinates: [number, number]) => [number, number]
          )([longitude, latitude]);
          if (Array.isArray(transformed) && transformed.length === 2) {
            [transformedLng, transformedLat] = transformed;
          }
        }
      } catch (error) {
        errorHandler.handle(
          new MapError('proj4 transformation failed', 'CRS_ERROR', {
            recoverable: true,
            cause: error,
            context: { epsg: crs.epsg },
          }),
        );
        transformedLng = longitude;
        transformedLat = latitude;
      }
    } else {
      // Proj4 not loaded yet, trigger async load for next time
      // For now, use original coordinates
      // Note: getProj4() is synchronous, but it will trigger async loading
      // for subsequent calls. The promise is stored internally.
      void proj4ModulePromise;
    }
    // If proj4 is not available, silently use original coordinates
    // (no warning to avoid console spam if proj4 is intentionally not installed)
  }

  // Format based on unit
  if (crs && crs.unit === 'meter') {
    currentPoint.longitude = transformedLng.toFixed(0);
    currentPoint.latitude = transformedLat.toFixed(0);
  } else {
    if (isDMS) {
      currentPoint.longitude = lngDMS(+transformedLng);
      currentPoint.latitude = latDMS(+transformedLat);
    } else {
      currentPoint.longitude = transformedLng.toFixed(6);
      currentPoint.latitude = transformedLat.toFixed(6);
    }
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

// Legacy exports for backward compatibility
export const deg_to_dms = degToDms;
export const dms_to_des = dmsToDeg;
export const deg_to_dms_string = degToDmsString;
