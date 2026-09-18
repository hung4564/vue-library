/** Shared pointer-drag positioning (devtools overlay + similar FABs). */

export type PanelPos = { left: number; top: number };

export type PanelSize = { width: number; height: number };

export type DevtoolsShellLayout = {
  lastSize: PanelSize;
  savedTogglePos: PanelPos | null;
  wasOpen: boolean;
  draggedWhileOpen: boolean;
};

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

export function samePanelPos(a: PanelPos, b: PanelPos): boolean {
  return a.left === b.left && a.top === b.top;
}

/**
 * When the shell grows/shrinks (toggle ↔ panel), keep the bottom-right
 * corner fixed (matches default `right`/`bottom` CSS anchors) then clamp.
 */
export function reanchorPanelPos(
  prev: PanelPos,
  prevWidth: number,
  prevHeight: number,
  el: HTMLElement,
): PanelPos {
  const left = prev.left + prevWidth - el.offsetWidth;
  const top = prev.top + prevHeight - el.offsetHeight;
  return clampPanelPos(left, top, el);
}

/** Reanchor when size changed; otherwise clamp into the offset parent. */
export function fitMovedPanelPos(
  pos: PanelPos,
  el: HTMLElement,
  prevSize: PanelSize,
): PanelPos {
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  if (
    prevSize.width > 0 &&
    prevSize.height > 0 &&
    (Math.abs(prevSize.width - w) > 1 || Math.abs(prevSize.height - h) > 1)
  ) {
    return reanchorPanelPos(pos, prevSize.width, prevSize.height, el);
  }
  return clampPanelPos(pos.left, pos.top, el);
}

/**
 * Open/close/resize for the floating Devtools FAB↔panel shell.
 * - Open: save toggle pos, expand from bottom-right, clamp into view.
 * - Close: restore saved toggle pos unless the open panel was dragged.
 */
export function syncDevtoolsShellPos(input: {
  pos: PanelPos | null;
  el: HTMLElement;
  isOpen: boolean;
  layout: DevtoolsShellLayout;
}): { pos: PanelPos | null; layout: DevtoolsShellLayout } {
  const { el, isOpen } = input;
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  const wasOpen = input.layout.wasOpen;

  let pos = input.pos;
  let savedTogglePos = input.layout.savedTogglePos;
  let draggedWhileOpen = input.layout.draggedWhileOpen;

  if (!pos) {
    return {
      pos: null,
      layout: {
        lastSize: { width, height },
        savedTogglePos,
        wasOpen: isOpen,
        draggedWhileOpen,
      },
    };
  }

  if (!wasOpen && isOpen) {
    savedTogglePos = { ...pos };
    draggedWhileOpen = false;
    pos = fitMovedPanelPos(pos, el, input.layout.lastSize);
  } else if (wasOpen && !isOpen) {
    pos = draggedWhileOpen
      ? fitMovedPanelPos(pos, el, input.layout.lastSize)
      : savedTogglePos
        ? clampPanelPos(savedTogglePos.left, savedTogglePos.top, el)
        : clampPanelPos(pos.left, pos.top, el);
  } else {
    pos = clampPanelPos(pos.left, pos.top, el);
  }

  return {
    pos,
    layout: {
      lastSize: { width, height },
      savedTogglePos,
      wasOpen: isOpen,
      draggedWhileOpen,
    },
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
