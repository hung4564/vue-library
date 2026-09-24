import { UniversalRegistry } from '../registry/universal-registry';

export const MAP_LAYER_SEARCH_SELECTOR = '[data-map-layer-search]';

function escapeAttrSelector(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/** Selector for the LayerControl search input of a given map. */
export function mapLayerSearchSelector(mapId: string): string {
  return `${MAP_LAYER_SEARCH_SELECTOR}[data-map-id="${escapeAttrSelector(mapId)}"]`;
}

function queryLayerSearch(mapId: string): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  return document.querySelector<HTMLElement>(mapLayerSearchSelector(mapId));
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return target.isContentEditable;
}

/**
 * Close the last open panel-like control for a map (popup / sidebar / float).
 * Returns true when a control was closed.
 * Blurs layer search only when that map's search currently owns focus.
 */
export function closeTopOpenMapControl(mapId: string): boolean {
  const open = UniversalRegistry.listControls(mapId).filter(
    (ctrl) =>
      ctrl.isOpen() &&
      (ctrl.panelKind === 'popup' ||
        ctrl.panelKind === 'sidebar' ||
        ctrl.panelKind === 'float'),
  );
  const top = open[open.length - 1];
  if (!top) return false;
  const active = document.activeElement;
  const search = queryLayerSearch(mapId);
  top.close();
  if (
    search &&
    active instanceof HTMLElement &&
    (active === search || search.contains(active))
  ) {
    active.blur();
  }
  return true;
}

function tryFocusLayerSearch(mapId: string): boolean {
  const el = queryLayerSearch(mapId);
  if (!el) return false;
  if (typeof el.focus === 'function') {
    el.focus();
  }
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    el.select?.();
  }
  return document.activeElement === el || el.contains(document.activeElement);
}

/**
 * Open LayerControl (if registered) and focus its search field.
 * Retries across animation frames / a short MutationObserver when the input
 * is not mounted yet.
 */
export function focusMapLayerSearch(mapId: string): boolean {
  const layer = UniversalRegistry.getControl('mapLayerControl', mapId);
  if (layer && !layer.isOpen()) {
    layer.open();
  }
  if (tryFocusLayerSearch(mapId)) return true;

  if (typeof requestAnimationFrame !== 'function') {
    return tryFocusLayerSearch(mapId);
  }

  let done = false;
  let frames = 0;
  let observer: MutationObserver | null = null;
  const finish = (ok: boolean) => {
    if (done) return ok;
    done = true;
    observer?.disconnect();
    return ok;
  };

  const tick = (): boolean => {
    if (tryFocusLayerSearch(mapId)) return finish(true);
    frames += 1;
    if (frames < 8) {
      requestAnimationFrame(() => {
        tick();
      });
      return false;
    }
    return finish(false);
  };

  if (
    typeof MutationObserver === 'function' &&
    typeof document !== 'undefined'
  ) {
    observer = new MutationObserver(() => {
      if (tryFocusLayerSearch(mapId)) finish(true);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => finish(false), 500);
  }

  requestAnimationFrame(() => {
    tick();
  });
  return true;
}

export type MapKeyboardShortcutOptions = {
  mapId: string;
  /** Escape closes top open control (default true). */
  escape?: boolean;
  /** `/` focuses layer search (default true). */
  slashSearch?: boolean;
};

/**
 * Document-level map shortcuts. Returns an unsubscribe function.
 * Skips when the user is typing in an input (except Escape).
 * Search focus is scoped to `mapId` via `[data-map-layer-search][data-map-id]`.
 */
export function bindMapKeyboardShortcuts(
  options: MapKeyboardShortcutOptions,
): () => void {
  const { mapId } = options;
  const escape = options.escape !== false;
  const slashSearch = options.slashSearch !== false;

  function onKeyDown(event: KeyboardEvent) {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return;
    }

    if (escape && event.key === 'Escape') {
      if (closeTopOpenMapControl(mapId)) {
        event.preventDefault();
      }
      return;
    }

    if (slashSearch && event.key === '/' && !isTypingTarget(event.target)) {
      if (focusMapLayerSearch(mapId)) {
        event.preventDefault();
      }
    }
  }

  document.addEventListener('keydown', onKeyDown);
  return () => document.removeEventListener('keydown', onKeyDown);
}
