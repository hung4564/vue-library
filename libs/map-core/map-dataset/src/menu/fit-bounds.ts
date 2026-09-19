import { fitBounds, type MapSimple } from '@hungpvq/map-core';
import type { MenuClickFitBounds } from './builder';

/**
 * Resolve the camera target from a fitBounds menu payload.
 * UX D: fit bounds is camera-only — never paints highlight.
 */
export function resolveFitBoundsMenuTarget(
  value: MenuClickFitBounds | unknown,
): unknown {
  if (
    value &&
    typeof value === 'object' &&
    'detail' in value &&
    (value as MenuClickFitBounds).detail != null
  ) {
    return (value as MenuClickFitBounds).detail;
  }
  return value;
}

/**
 * Apply list-menu fitBounds. Camera only — does not call highlight APIs (UX D).
 */
export function runFitBoundsMenuAction(
  map: MapSimple,
  value: MenuClickFitBounds | unknown,
): void {
  const target = resolveFitBoundsMenuTarget(value);
  if (target) fitBounds(map, target as never);
}
