import { methodRegistry } from '../registry';
import { getMap } from '../store';
import type { MapSimple } from '../types';
import { copyText } from '../utils/map-info';
import type { MapContextMenuTarget, MapMenuItemProps } from './types';
import { MAP_CONTEXT_MENU_ID } from './types';

export function formatMapContextCoords(
  lng: number,
  lat: number,
  digits = 6,
): string {
  return `${lat.toFixed(digits)}, ${lng.toFixed(digits)}`;
}

export function pointFeatureGeojson(lng: number, lat: number): string {
  return JSON.stringify(
    {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [lng, lat] },
    },
    null,
    2,
  );
}

export function pointWkt(lng: number, lat: number): string {
  return `POINT (${lng} ${lat})`;
}

function withMap(mapId: string, fn: (map: MapSimple) => void) {
  getMap(mapId, (map) => {
    fn(map);
  });
}

export function copyMapPointAsGeojson(target: MapContextMenuTarget) {
  return copyText(pointFeatureGeojson(target.lngLat.lng, target.lngLat.lat));
}

export function copyMapPointCoords(target: MapContextMenuTarget) {
  return copyText(formatMapContextCoords(target.lngLat.lng, target.lngLat.lat));
}

export function copyMapPointWkt(target: MapContextMenuTarget) {
  return copyText(pointWkt(target.lngLat.lng, target.lngLat.lat));
}

export function centerMapHere(props: MapMenuItemProps) {
  const { lng, lat } = props.layer.lngLat;
  withMap(props.mapId, (map) => {
    map.easeTo({ center: [lng, lat] });
  });
}

export function zoomInMapHere(props: MapMenuItemProps, delta = 2) {
  const { lng, lat } = props.layer.lngLat;
  withMap(props.mapId, (map) => {
    const next = Math.min(map.getMaxZoom(), map.getZoom() + delta);
    map.easeTo({ center: [lng, lat], zoom: next });
  });
}

export function openGoogleMaps(target: MapContextMenuTarget) {
  const { lng, lat } = target.lngLat;
  window.open(
    `https://www.google.com/maps?q=${lat},${lng}`,
    '_blank',
    'noopener,noreferrer',
  );
}

export function openGoogleEarth(target: MapContextMenuTarget) {
  const { lng, lat } = target.lngLat;
  window.open(
    `https://earth.google.com/web/@${lat},${lng},800a,35y,0h,0t,0r`,
    '_blank',
    'noopener,noreferrer',
  );
}

export function identifyFeaturesHere(props: MapMenuItemProps) {
  const handler = methodRegistry.getMenuHandler(
    MAP_CONTEXT_MENU_ID.identifyHere,
    props.mapId,
  );
  if (handler) {
    void handler(props);
  }
}
