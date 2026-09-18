/** Shared pointer-drag positioning (same pattern as demo DemoHelpPanel). */

export type PanelPos = { left: number; top: number };

export const PANEL_DRAG_THRESHOLD_PX = 4;

export function offsetParentRect(el: HTMLElement): {
  left: number;
  top: number;
  width: number;
  height: number;
} {
  const parent = el.offsetParent as HTMLElement | null;
  if (!parent) {
    return {
      left: 0,
      top: 0,
      width: typeof window !== 'undefined' ? window.innerWidth : 0,
      height: typeof window !== 'undefined' ? window.innerHeight : 0,
    };
  }
  const r = parent.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

export function clampPanelPos(
  left: number,
  top: number,
  el: HTMLElement,
): PanelPos {
  const parent = offsetParentRect(el);
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const maxL = Math.max(0, parent.width - w);
  const maxT = Math.max(0, parent.height - h);
  return {
    left: Math.min(Math.max(0, left), maxL),
    top: Math.min(Math.max(0, top), maxT),
  };
}

export type PanelDragHandlers = {
  onMove: (pos: PanelPos) => void;
  onEnd?: (moved: boolean) => void;
  onDraggingChange?: (dragging: boolean) => void;
  thresholdPx?: number;
};

/**
 * Start a window-level pointer drag for `el` from a pointerdown event.
 * Returns a dispose function; also cleans up on pointerup/cancel.
 */
export function beginPanelDrag(
  el: HTMLElement,
  e: PointerEvent,
  handlers: PanelDragHandlers,
): () => void {
  if (e.button !== 0) return () => undefined;

  const threshold = handlers.thresholdPx ?? PANEL_DRAG_THRESHOLD_PX;
  const parent = offsetParentRect(el);
  const rect = el.getBoundingClientRect();
  const pointerId = e.pointerId;
  const originX = e.clientX;
  const originY = e.clientY;
  const startLeft = rect.left - parent.left;
  const startTop = rect.top - parent.top;
  let moved = false;
  let dragging = false;

  const onMove = (ev: PointerEvent) => {
    if (ev.pointerId !== pointerId) return;
    const dx = ev.clientX - originX;
    const dy = ev.clientY - originY;
    if (!moved && Math.hypot(dx, dy) < threshold) return;
    moved = true;
    if (!dragging) {
      dragging = true;
      handlers.onDraggingChange?.(true);
    }
    ev.preventDefault();
    handlers.onMove(clampPanelPos(startLeft + dx, startTop + dy, el));
  };

  const onUp = (ev: PointerEvent) => {
    if (ev.pointerId !== pointerId) return;
    dispose();
    handlers.onDraggingChange?.(false);
    handlers.onEnd?.(moved);
  };

  const dispose = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
  };

  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  return dispose;
}

export function panelPosStyle(
  pos: PanelPos | null | undefined,
): Record<string, string> | undefined {
  if (!pos) return undefined;
  return {
    left: `${pos.left}px`,
    top: `${pos.top}px`,
    right: 'auto',
    bottom: 'auto',
  };
}
