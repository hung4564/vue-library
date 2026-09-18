import type { MapSimple } from '../types';

function isMouseEventLike(value: unknown): value is MouseEvent {
  if (value == null || typeof value !== 'object') return false;
  if (typeof MouseEvent !== 'undefined' && value instanceof MouseEvent) {
    return true;
  }
  // Node / non-DOM: accept objects that look like a MouseEvent for MapLibre.
  return 'type' in value && typeof (value as { type: unknown }).type === 'string';
}

/** Resolve a MapLibre `originalEvent` from React synthetic or raw MouseEvent. */
export function resolveOriginalEvent(e?: unknown): MouseEvent | undefined {
  if (e == null || typeof e !== 'object') return undefined;
  if ('nativeEvent' in e) {
    const native = (e as { nativeEvent?: unknown }).nativeEvent;
    return isMouseEventLike(native) ? (native as MouseEvent) : undefined;
  }
  return isMouseEventLike(e) ? (e as MouseEvent) : undefined;
}


export function zoomIn(map: MapSimple, e?: unknown): void {
  map.zoomIn({}, { originalEvent: resolveOriginalEvent(e) });
}

export function zoomOut(map: MapSimple, e?: unknown): void {
  map.zoomOut({}, { originalEvent: resolveOriginalEvent(e) });
}

export function resetBearing(map: MapSimple): void {
  map.easeTo({ bearing: 0, pitch: 0 });
}

export function bearingToCompassTransform(bearing: number): string {
  return `rotate(${bearing * -1}deg)`;
}

export function attachRotateListener(
  map: MapSimple,
  onRotate: (transform: string) => void,
): () => void {
  const handler = () => {
    onRotate(bearingToCompassTransform(map.getBearing()));
  };
  map.on('rotate', handler);
  return () => {
    map.off('rotate', handler);
  };
}
