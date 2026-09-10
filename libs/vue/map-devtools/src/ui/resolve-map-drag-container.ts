/** Prefer explicit id; otherwise first map DraggableContainer in the DOM. */
export function resolveMapDragContainerId(
  explicit?: string | null,
): string | null {
  if (explicit) return explicit;
  if (typeof document === 'undefined') return null;
  const el = document.querySelector('[id^="map-draggable-"]');
  return el?.id ?? null;
}

export const DEVTOOLS_MOBILE_BREAKPOINT = 640;

export function isDevtoolsMobileViewport(
  width = typeof window !== 'undefined' ? window.innerWidth : DEVTOOLS_MOBILE_BREAKPOINT + 1,
): boolean {
  return width <= DEVTOOLS_MOBILE_BREAKPOINT;
}
