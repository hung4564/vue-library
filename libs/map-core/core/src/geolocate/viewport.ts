import type { MapSimple } from '../types';

/** Default `fitBounds` maxZoom — same as mapboxgl.GeolocateControl. */
export const GEOLOCATE_DEFAULT_MAX_ZOOM = 15;

/** First-party `Map#fitBounds` / easing fields (do not re-export maplibre-gl types). */
export type GeoLocateFitBoundsOptions = {
  maxZoom?: number;
  minZoom?: number;
  padding?:
    | number
    | { top?: number; bottom?: number; left?: number; right?: number };
  offset?: [number, number];
  duration?: number;
  essential?: boolean;
  linear?: boolean;
  easing?: (t: number) => number;
};

export const GEOLOCATE_DEFAULT_FIT_BOUNDS_OPTIONS: GeoLocateFitBoundsOptions = {
  maxZoom: GEOLOCATE_DEFAULT_MAX_ZOOM,
};

export type GeoLocateWatchState =
  | 'OFF'
  | 'WAITING_ACTIVE'
  | 'ACTIVE_LOCK'
  | 'ACTIVE_ERROR'
  | 'BACKGROUND'
  | 'BACKGROUND_ERROR';

export type GeoLocateClickAction =
  | 'request-once'
  | 'start-watch'
  | 'stop'
  | 're-lock';

/**
 * Click state machine matching mapboxgl / MapLibre GeolocateControl
 * (`trackUserLocation: true` uses watch states; `false` always one-shot locate).
 */
export function resolveGeolocateClick(
  watchState: GeoLocateWatchState,
  trackUserLocation: boolean,
): GeoLocateClickAction {
  if (!trackUserLocation) return 'request-once';
  switch (watchState) {
    case 'OFF':
      return 'start-watch';
    case 'WAITING_ACTIVE':
    case 'ACTIVE_LOCK':
    case 'ACTIVE_ERROR':
      return 'stop';
    case 'BACKGROUND':
    case 'BACKGROUND_ERROR':
      return 're-lock';
  }
}

export function isGeolocateErrorState(
  watchState: GeoLocateWatchState,
): boolean {
  return (
    watchState === 'ACTIVE_ERROR' || watchState === 'BACKGROUND_ERROR'
  );
}

export function accuracyCircleDiameterPx(
  map: MapSimple,
  accuracyMeters: number,
): number {
  if (!Number.isFinite(accuracyMeters) || accuracyMeters <= 0) return 0;
  const container = map.getContainer();
  const height =
    container.getBoundingClientRect?.().height ?? container.clientHeight ?? 0;
  if (!height) return 0;
  const y = height / 2;
  const a = map.unproject([0, y]);
  const b = map.unproject([1, y]);
  const metersPerPixel = a.distanceTo(b);
  if (!metersPerPixel || !Number.isFinite(metersPerPixel)) return 0;
  return Math.ceil((2 * accuracyMeters) / metersPerPixel);
}

/** Bounds of a circle around a WGS84 point (meters), for `fitBounds` like Mapbox. */
export function lngLatAccuracyBounds(
  lng: number,
  lat: number,
  accuracyMeters: number,
): [[number, number], [number, number]] {
  const radius = Number.isFinite(accuracyMeters) ? Math.max(accuracyMeters, 1) : 1;
  const metersPerDegLat = 111319.9;
  const latDelta = radius / metersPerDegLat;
  const cos = Math.cos((lat * Math.PI) / 180);
  const metersPerDegLng = metersPerDegLat * Math.max(Math.abs(cos), 1e-6);
  const lngDelta = radius / metersPerDegLng;
  return [
    [lng - lngDelta, lat - latDelta],
    [lng + lngDelta, lat + latDelta],
  ];
}
