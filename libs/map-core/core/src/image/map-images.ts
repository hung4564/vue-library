import type { StyleImage } from 'maplibre-gl';
import type { MapSimple } from '../types';

/** Snapshot style images currently registered on a map instance. */
export function listMapStyleImages(
  map: MapSimple,
): Record<string, StyleImage> {
  if (!map) return {};
  const result: Record<string, StyleImage> = {};
  for (const name of map.listImages()) {
    const img = map.getImage(name);
    if (img) result[name] = img;
  }
  return result;
}

/**
 * Listen for style/idle events that may change the image registry.
 * Returns a cleanup function that removes listeners from the same map instance.
 */
export function subscribeMapStyleImages(
  map: MapSimple,
  listener: () => void,
): () => void {
  if (!map) return () => undefined;
  map.on('styledata', listener);
  map.on('idle', listener);
  return () => {
    map.off('styledata', listener);
    map.off('idle', listener);
  };
}
