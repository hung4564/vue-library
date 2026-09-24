/**
 * Shared Fullscreen API helpers (framework-agnostic).
 * Includes vendor-prefixed Safari / older Firefox support.
 */

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  mozCancelFullScreen?: () => Promise<void> | void;
};

type FullscreenElement = Element & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
};

function asFullscreenDoc(
  doc: Document = typeof document !== 'undefined'
    ? document
    : (undefined as unknown as Document),
): FullscreenDocument {
  return doc as FullscreenDocument;
}

/** Current fullscreen element across standard + vendor prefixes. */
export function getFullscreenElement(
  doc: Document = typeof document !== 'undefined'
    ? document
    : (undefined as unknown as Document),
): Element | null {
  const d = asFullscreenDoc(doc);
  return (
    d?.fullscreenElement ??
    d?.webkitFullscreenElement ??
    d?.mozFullScreenElement ??
    null
  );
}

/**
 * Whether the document is fullscreen.
 * When `root` is provided, only returns true if that element is the fullscreen target.
 */
export function isDocumentFullscreen(
  doc: Document = typeof document !== 'undefined'
    ? document
    : (undefined as unknown as Document),
  root?: Element | null,
): boolean {
  const active = getFullscreenElement(doc);
  if (!active) return false;
  if (root) return active === root;
  return true;
}

export async function requestElementFullscreen(
  element: Element | null | undefined,
): Promise<void> {
  if (!element) return;
  const el = element as FullscreenElement;
  if (typeof el.requestFullscreen === 'function') {
    await el.requestFullscreen();
    return;
  }
  if (typeof el.webkitRequestFullscreen === 'function') {
    await el.webkitRequestFullscreen();
    return;
  }
  if (typeof el.mozRequestFullScreen === 'function') {
    await el.mozRequestFullScreen();
  }
}

export async function exitDocumentFullscreen(
  doc: Document = typeof document !== 'undefined'
    ? document
    : (undefined as unknown as Document),
): Promise<void> {
  const d = asFullscreenDoc(doc);
  if (!getFullscreenElement(d)) return;
  if (typeof d.exitFullscreen === 'function') {
    await d.exitFullscreen();
    return;
  }
  if (typeof d.webkitExitFullscreen === 'function') {
    await d.webkitExitFullscreen();
    return;
  }
  if (typeof d.mozCancelFullScreen === 'function') {
    await d.mozCancelFullScreen();
  }
}

/**
 * Toggle fullscreen on `element` (enter) or exit when already fullscreen
 * (optionally only when `element` is the active fullscreen root).
 * @returns whether the document is fullscreen after the call settles
 */
export async function toggleElementFullscreen(
  element: Element | null | undefined,
  doc: Document = typeof document !== 'undefined'
    ? document
    : (undefined as unknown as Document),
): Promise<boolean> {
  if (
    isDocumentFullscreen(doc, element ?? null) ||
    (!element && isDocumentFullscreen(doc))
  ) {
    await exitDocumentFullscreen(doc);
    return false;
  }
  await requestElementFullscreen(element);
  return (
    isDocumentFullscreen(doc, element ?? null) || isDocumentFullscreen(doc)
  );
}

const FULLSCREEN_EVENTS = [
  'fullscreenchange',
  'webkitfullscreenchange',
  'mozfullscreenchange',
] as const;

export function subscribeFullscreenChange(
  onChange: () => void,
  doc: Document = typeof document !== 'undefined'
    ? document
    : (undefined as unknown as Document),
): () => void {
  if (!doc?.addEventListener) return () => undefined;
  for (const name of FULLSCREEN_EVENTS) {
    doc.addEventListener(name, onChange);
  }
  return () => {
    for (const name of FULLSCREEN_EVENTS) {
      doc.removeEventListener(name, onChange);
    }
  };
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

/** True when fullscreen element is the resolved map root (or a descendant thereof). */
export function isMapRootFullscreen(
  start: Element | null | undefined,
  doc: Document = typeof document !== 'undefined'
    ? document
    : (undefined as unknown as Document),
): boolean {
  const root = resolveMapFullscreenTarget(start);
  const active = getFullscreenElement(doc);
  if (!root || !active) return false;
  return active === root || root.contains(active) || active.contains(root);
}
