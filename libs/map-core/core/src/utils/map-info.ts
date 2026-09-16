import type { MapSimple } from '../types';

export type MapViewInfo = {
  center: string;
  zoom: string;
  pitch: string;
  bearing: string;
  projection: string;
  bounds: string;
};

export const EMPTY_MAP_VIEW_INFO: MapViewInfo = {
  center: '',
  zoom: '',
  pitch: '',
  bearing: '',
  projection: '',
  bounds: '',
};

export function formatCoordPair(
  lng: number,
  lat: number,
  digits = 4,
): string {
  return `${lng.toFixed(digits)}, ${lat.toFixed(digits)}`;
}

export function formatDegree(value: number, digits = 1): string {
  return `${value.toFixed(digits)}°`;
}

export function formatProjectionName(type?: string | null): string {
  if (!type) return '';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function formatLngLatBounds(
  west: number,
  south: number,
  east: number,
  north: number,
  digits = 4,
): string {
  return [
    west.toFixed(digits),
    south.toFixed(digits),
    east.toFixed(digits),
    north.toFixed(digits),
  ].join(', ');
}

export function readMapViewInfo(map: MapSimple): MapViewInfo {
  const center = map.getCenter();
  const bounds = map.getBounds();
  const projection = map.getProjection?.()?.type;
  const projectionType = typeof projection === 'string' ? projection : '';
  return {
    center: formatCoordPair(center.lng, center.lat),
    zoom: map.getZoom().toFixed(2),
    pitch: formatDegree(map.getPitch()),
    bearing: formatDegree(map.getBearing()),
    projection: formatProjectionName(projectionType) || 'Mercator',
    bounds: formatLngLatBounds(
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ),
  };
}

export function copyText(value: string): Promise<void> {
  if (!value) return Promise.resolve();
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(value);
  }
  return Promise.resolve();
}

/** Default duration for copy success UI feedback (icon / title swap). */
export const COPY_FEEDBACK_MS = 1500;

export type CopyFeedbackController = {
  /** Currently highlighted copy key, or null. */
  getCopiedKey: () => string | null;
  /**
   * Copy `value` via {@link copyText}. On success, marks `key` as copied for
   * {@link COPY_FEEDBACK_MS} (or `durationMs`) then clears it.
   */
  copy: (key: string, value: string) => Promise<boolean>;
  dispose: () => void;
};

/**
 * Framework-agnostic copy + short-lived “copied” key for button feedback
 * (e.g. mdiContentCopy → mdiCheck). No toast.
 */
export function createCopyFeedback(options?: {
  durationMs?: number;
  onChange?: (copiedKey: string | null) => void;
}): CopyFeedbackController {
  const durationMs = options?.durationMs ?? COPY_FEEDBACK_MS;
  let copiedKey: string | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function setKey(next: string | null) {
    copiedKey = next;
    options?.onChange?.(next);
  }

  return {
    getCopiedKey: () => copiedKey,
    async copy(key: string, value: string) {
      const text = String(value ?? '').trim();
      if (!text || text === '—') return false;
      try {
        await copyText(text);
      } catch {
        return false;
      }
      if (timer) clearTimeout(timer);
      setKey(key);
      timer = setTimeout(() => {
        timer = undefined;
        setKey(null);
      }, durationMs);
      return true;
    },
    dispose() {
      if (timer) clearTimeout(timer);
      timer = undefined;
      setKey(null);
    },
  };
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Copy a data-URL image to the clipboard via {@link ClipboardItem}.
 * Rejects when the Clipboard API is unavailable.
 */
export async function copyImageDataUrl(dataUrl: string): Promise<void> {
  if (!dataUrl) return;
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new Error('Clipboard image copy is not supported in this browser');
  }
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const type = blob.type || 'image/png';
  await navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
}
