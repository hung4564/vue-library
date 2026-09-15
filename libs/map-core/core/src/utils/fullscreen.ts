/**
 * Shared Fullscreen API helpers (framework-agnostic).
 */

export function isDocumentFullscreen(
  doc: Document = typeof document !== 'undefined' ? document : (undefined as unknown as Document),
): boolean {
  return !!doc?.fullscreenElement;
}

export async function requestElementFullscreen(
  element: Element | null | undefined,
): Promise<void> {
  if (!element || typeof element.requestFullscreen !== 'function') return;
  await element.requestFullscreen();
}

export async function exitDocumentFullscreen(
  doc: Document = typeof document !== 'undefined' ? document : (undefined as unknown as Document),
): Promise<void> {
  if (!doc?.fullscreenElement || typeof doc.exitFullscreen !== 'function') return;
  await doc.exitFullscreen();
}

/**
 * Toggle fullscreen on `element` (enter) or exit when already fullscreen.
 * @returns whether the document is fullscreen after the call settles
 */
export async function toggleElementFullscreen(
  element: Element | null | undefined,
  doc: Document = typeof document !== 'undefined' ? document : (undefined as unknown as Document),
): Promise<boolean> {
  if (isDocumentFullscreen(doc)) {
    await exitDocumentFullscreen(doc);
    return false;
  }
  await requestElementFullscreen(element);
  return isDocumentFullscreen(doc);
}

export function subscribeFullscreenChange(
  onChange: () => void,
  doc: Document = typeof document !== 'undefined' ? document : (undefined as unknown as Document),
): () => void {
  if (!doc?.addEventListener) return () => undefined;
  doc.addEventListener('fullscreenchange', onChange);
  return () => doc.removeEventListener('fullscreenchange', onChange);
}

/** Walk up to `.map-container` or BODY for fullscreen target. */
export function resolveMapFullscreenTarget(
  start: Element | null | undefined,
): HTMLElement | null {
  let el: Element | null | undefined = start;
  while (el) {
    if (
      el instanceof HTMLElement &&
      (el.classList.contains('map-container') || el.tagName === 'BODY')
    ) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}
