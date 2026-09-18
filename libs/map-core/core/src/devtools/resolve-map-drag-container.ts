import { moduleDraggableHostId } from '../ui/module-container';

/**
 * Resolve a map `DraggableContainer` host id.
 * Prefer `explicit`; otherwise derive from `mapId` (`map-draggable-${mapId}`).
 * Does **not** fall back to the first `[id^="map-draggable-"]` in the document
 * (unsafe when multiple maps share a page).
 */
export function resolveMapDragContainerId(
  explicit?: string | null,
  mapId?: string | null,
): string | null {
  if (explicit) return explicit;
  if (mapId) return moduleDraggableHostId(mapId);
  return null;
}

export const DEVTOOLS_MOBILE_BREAKPOINT = 640;

export function isDevtoolsMobileViewport(
  width = typeof window !== 'undefined'
    ? window.innerWidth
    : DEVTOOLS_MOBILE_BREAKPOINT + 1,
): boolean {
  return width <= DEVTOOLS_MOBILE_BREAKPOINT;
}
