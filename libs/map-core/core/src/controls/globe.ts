import type { MapSimple } from '../types';

export function getProjectionType(map: MapSimple): string | undefined {
  const type = map.getProjection()?.type;
  return typeof type === 'string' ? type : undefined;
}

export function isGlobeProjection(type: string | undefined): boolean {
  return type === 'globe';
}

/** Toggle mercator ↔ globe; returns the new projection type. */
export function toggleGlobeProjection(
  map: MapSimple,
  current?: string,
): string | undefined {
  if (current === 'mercator' || !current) {
    map.setProjection({ type: 'globe' });
  } else {
    map.setProjection({ type: 'mercator' });
  }
  return getProjectionType(map);
}

export function attachGlobeProjectionListener(
  map: MapSimple,
  onChange: (type: string | undefined) => void,
): () => void {
  const handler = () => onChange(getProjectionType(map));
  map.on('styledata', handler);
  return () => {
    map.off('styledata', handler);
  };
}
