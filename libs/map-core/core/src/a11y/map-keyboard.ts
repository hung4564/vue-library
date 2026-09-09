import { UniversalRegistry } from '../registry/universal-registry';

export const MAP_LAYER_SEARCH_SELECTOR = '[data-map-layer-search]';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return target.isContentEditable;
}

/**
 * Close the last open panel-like control for a map (popup / sidebar / float).
 * Returns true when a control was closed.
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
  top.close();
  return true;
}

/**
 * Open LayerControl (if registered) and focus its search field.
 */
export function focusMapLayerSearch(mapId: string): boolean {
  const layer = UniversalRegistry.getControl('mapLayerControl', mapId);
  if (layer && !layer.isOpen()) {
    layer.open();
  }
  const el = document.querySelector<HTMLElement>(MAP_LAYER_SEARCH_SELECTOR);
  if (!el) return false;
  if (typeof el.focus === 'function') {
    el.focus();
  }
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    el.select?.();
  }
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
 */
export function bindMapKeyboardShortcuts(
  options: MapKeyboardShortcutOptions,
): () => void {
  const { mapId } = options;
  const escape = options.escape !== false;
  const slashSearch = options.slashSearch !== false;

  function onKeyDown(event: KeyboardEvent) {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
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
