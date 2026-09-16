/**
 * Framework-agnostic measurement formatting utilities
 */

import { formatNumber } from '../utils/number';

export type DistanceUnit = 'auto' | 'm' | 'km' | 'ft' | 'mi';
export type AreaUnit = 'auto' | 'm2' | 'km2' | 'ha' | 'acre';

export type MeasurementLabelPrefs = {
  /** Cumulative / vertex labels (distance mode). */
  showVertexLabels: boolean;
  /** Mid-edge length labels (area / distance segments). */
  showEdgeLabels: boolean;
  /** Center / primary result label (area, angle, point, …). */
  showResultLabel: boolean;
};

let preferredDistanceUnit: DistanceUnit = 'auto';
let preferredAreaUnit: AreaUnit = 'auto';
let labelPrefs: MeasurementLabelPrefs = {
  showVertexLabels: true,
  showEdgeLabels: true,
  showResultLabel: true,
};

/** Set preferred distance unit for measure formatters (session-wide). */
export function setMeasurementDistanceUnit(unit: DistanceUnit): void {
  preferredDistanceUnit = unit;
}

/** Set preferred area unit for measure formatters (session-wide). */
export function setMeasurementAreaUnit(unit: AreaUnit): void {
  preferredAreaUnit = unit;
}

export function getMeasurementDistanceUnit(): DistanceUnit {
  return preferredDistanceUnit;
}

export function getMeasurementAreaUnit(): AreaUnit {
  return preferredAreaUnit;
}

export function getMeasurementLabelPrefs(): MeasurementLabelPrefs {
  return { ...labelPrefs };
}

export function setMeasurementLabelPrefs(
  next: Partial<MeasurementLabelPrefs>,
): void {
  labelPrefs = { ...labelPrefs, ...next };
}

/**
 * Readable map text rotation (degrees) so labels follow an edge
 * without upside-down text. Input coords are [lng, lat].
 *
 * MapLibre text baseline is horizontal (east–west); subtract 90° from
 * geographic bearing so the baseline lies along the edge.
 */
export function edgeLabelRotation(
  start: [number, number],
  end: [number, number],
): number {
  const [lng1, lat1] = start;
  const [lng2, lat2] = end;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const lat1r = (lat1 * Math.PI) / 180;
  const lat2r = (lat2 * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2r);
  const x =
    Math.cos(lat1r) * Math.sin(lat2r) -
    Math.sin(lat1r) * Math.cos(lat2r) * Math.cos(dLng);
  // Align horizontal text baseline with the edge, then keep text upright.
  let angle = (Math.atan2(y, x) * 180) / Math.PI - 90;
  if (angle > 90) angle -= 180;
  if (angle < -90) angle += 180;
  return angle;
}

/**
 * Format distance value. Input is kilometers (Turf length default).
 */
export function formatDistanceText(
  value = 0,
  locales = 'vi',
  unit: DistanceUnit = preferredDistanceUnit,
): string {
  const km = value;
  const resolved =
    unit === 'auto' ? (km < 1 ? 'm' : 'km') : unit;

  switch (resolved) {
    case 'm':
      return `${formatNumber((km * 1000).toFixed(2), locales)} m`;
    case 'ft':
      return `${formatNumber((km * 3280.839895).toFixed(2), locales)} ft`;
    case 'mi':
      return `${formatNumber((km * 0.621371192).toFixed(2), locales)} mi`;
    case 'km':
    default:
      return `${formatNumber(km.toFixed(2), locales)} km`;
  }
}

/**
 * Format area value. Input is square meters (Turf area default).
 */
export function formatAreaText(
  value = 0,
  locales = 'vi',
  unit: AreaUnit = preferredAreaUnit,
): string {
  const m2 = value;
  const resolved =
    unit === 'auto' ? (m2 < 1_000_000 ? 'm2' : 'km2') : unit;

  switch (resolved) {
    case 'km2':
      return `${formatNumber((m2 / 1_000_000).toFixed(2), locales)} km²`;
    case 'ha':
      return `${formatNumber((m2 / 10_000).toFixed(2), locales)} ha`;
    case 'acre':
      return `${formatNumber((m2 / 4046.8564224).toFixed(2), locales)} ac`;
    case 'm2':
    default:
      return `${formatNumber(m2.toFixed(2), locales)} m²`;
  }
}
