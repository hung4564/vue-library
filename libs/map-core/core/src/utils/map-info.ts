import type { Coordinates, MapSimple } from '../types';

export type MapViewInfo = {
  center: string;
  zoom: string;
  pitch: string;
  bearing: string;
  projection: string;
  bounds: string;
};

export const EMPTY_MAP_VIEW_INFO: MapViewInfo = {
  center: '',
  zoom: '',
  pitch: '',
  bearing: '',
  projection: '',
  bounds: '',
};

export function formatCoordPair(
  lng: number,
  lat: number,
  digits = 4,
): string {
  return `${lng.toFixed(digits)}, ${lat.toFixed(digits)}`;
}

export function formatDegree(value: number, digits = 1): string {
  return `${value.toFixed(digits)}°`;
}

export function formatProjectionName(type?: string | null): string {
  if (!type) return '';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function formatLngLatBounds(
  west: number,
  south: number,
  east: number,
  north: number,
  digits = 4,
): string {
  return [
    west.toFixed(digits),
    south.toFixed(digits),
    east.toFixed(digits),
    north.toFixed(digits),
  ].join(', ');
}

export function readMapViewInfo(map: MapSimple): MapViewInfo {
  const center = map.getCenter();
  const bounds = map.getBounds();
  const projection = map.getProjection?.()?.type;
  const projectionType = typeof projection === 'string' ? projection : '';
  return {
    center: formatCoordPair(center.lng, center.lat),
    zoom: map.getZoom().toFixed(2),
    pitch: formatDegree(map.getPitch()),
    bearing: formatDegree(map.getBearing()),
    projection: formatProjectionName(projectionType) || 'Mercator',
    bounds: formatLngLatBounds(
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ),
  };
}

export function formatBboxCorners(
  a?: Coordinates,
  b?: Coordinates,
  digits = 4,
): string {
  if (!a || !b) return '';
  const west = Math.min(a.x, b.x);
  const east = Math.max(a.x, b.x);
  const south = Math.min(a.y, b.y);
  const north = Math.max(a.y, b.y);
  return formatLngLatBounds(west, south, east, north, digits);
}

export function copyText(value: string): Promise<void> {
  if (!value) return Promise.resolve();
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(value);
  }
  return Promise.resolve();
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
