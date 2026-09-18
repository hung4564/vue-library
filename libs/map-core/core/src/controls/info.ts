import type { MapSimple } from '../types';

/**
 * Attach map view listeners used by InfoControl; returns detach.
 */
export function attachMapViewInfoListeners(
  map: MapSimple,
  onUpdate: () => void,
  events: string[] = ['move', 'pitch', 'rotate', 'styledata'],
): () => void {
  for (const type of events) {
    map.on(type, onUpdate);
  }
  return () => {
    for (const type of events) {
      map.off(type, onUpdate);
    }
  };
}
