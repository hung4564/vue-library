import type { MapSimple } from '../types';

export type HomeView = {
  center: { lat: number; lng: number };
  zoom: number;
};

export type CaptureHomeViewOptions = {
  zoom?: number;
  center?: number[];
};

/**
 * Capture home view from explicit props or the live map.
 */
export function captureHomeView(
  map: MapSimple,
  opts: CaptureHomeViewOptions = {},
): HomeView {
  const zoom = opts.zoom != null ? opts.zoom : map.getZoom();
  if (opts.center != null) {
    return {
      zoom,
      center: { lat: opts.center[1], lng: opts.center[0] },
    };
  }
  const c = map.getCenter();
  return {
    zoom,
    center: { lat: c.lat, lng: c.lng },
  };
}

export function goHome(map: MapSimple, view: HomeView): void {
  map.setZoom(view.zoom);
  map.setCenter(view.center);
}
