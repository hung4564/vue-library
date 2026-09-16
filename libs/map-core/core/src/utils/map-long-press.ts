import type { MapSimple } from '../types';

export type MapLongPressOptions = {
  /** Hold duration in ms (default 500). */
  durationMs?: number;
  /** Cancel if pointer moves more than this many CSS pixels (default 10). */
  moveThresholdPx?: number;
  onLongPress: (point: { x: number; y: number }, event: PointerEvent) => void;
};

/**
 * Attach a long-press listener to the map canvas (pointer events).
 * Returns an unsubscribe function.
 */
export function bindMapLongPress(
  map: MapSimple,
  options: MapLongPressOptions,
): () => void {
  const canvas = map.getCanvas();
  const durationMs = options.durationMs ?? 500;
  const moveThresholdPx = options.moveThresholdPx ?? 10;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let startX = 0;
  let startY = 0;
  let startEvent: PointerEvent | null = null;

  const clear = () => {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }
    startEvent = null;
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    clear();
    startX = event.clientX;
    startY = event.clientY;
    startEvent = event;
    timer = setTimeout(() => {
      if (!startEvent) return;
      const rect = canvas.getBoundingClientRect();
      options.onLongPress(
        {
          x: startX - rect.left - canvas.clientLeft,
          y: startY - rect.top - canvas.clientTop,
        },
        startEvent,
      );
      clear();
    }, durationMs);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (timer == null) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (dx * dx + dy * dy > moveThresholdPx * moveThresholdPx) {
      clear();
    }
  };

  const onPointerUp = () => clear();

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);

  return () => {
    clear();
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointercancel', onPointerUp);
  };
}
