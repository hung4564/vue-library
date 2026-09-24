import type { Position } from '../types';
import type { ResolvedControlLayout } from '../utils/control-layout';

/** Layout values that hide per-control corner `#btn` chrome (toolbar / menu hosts own it). */
export type ModuleCornerChromeLayout =
  ResolvedControlLayout | 'button' | 'standalone' | 'toolbar' | 'menu';

export type ModuleBindPosition = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  containerId: string;
};

/** Bare corner host id (`top-left-map-1`). */
export function moduleCornerHostId(position: Position, mapId: string): string {
  return `${position}-${mapId}`;
}

/** CSS selector for corner host (`#top-left-map-1`). */
export function moduleCornerHostSelector(
  position: Position,
  mapId: string,
): string {
  return `#${moduleCornerHostId(position, mapId)}`;
}

/** Bare draggable host id (`map-draggable-map-1`). */
export function moduleDraggableHostId(mapId: string): string {
  return `map-draggable-${mapId}`;
}

/** CSS selector for draggable host (`#map-draggable-map-1`). */
export function moduleDraggableHostSelector(mapId: string): string {
  return `#${moduleDraggableHostId(mapId)}`;
}

/**
 * Whether ModuleContainer should teleport corner `#btn` / `btnOutside`.
 * Hidden when layout is `toolbar` or `menu` (ToolbarControl owns chrome).
 */
export function isModuleCornerChromeVisible(
  controlLayout: ModuleCornerChromeLayout | undefined,
): boolean {
  return controlLayout !== 'toolbar' && controlLayout !== 'menu';
}

/** Classes on the teleported `.btn-module-container` wrapper. */
export function moduleBtnContainerClassName(controlId?: string): string {
  const id = controlId?.trim();
  if (id) {
    return `btn-module-container map-common-button ${id}-btn-module-container`;
  }
  return 'btn-module-container map-common-button';
}

/**
 * Default draggable bind offsets for a map corner (matches Vue/React ModuleContainer).
 */
export function buildModuleBindPosition(options: {
  position: Position;
  btnWidth: number;
  containerId: string;
}): ModuleBindPosition {
  const result: ModuleBindPosition = {
    containerId: options.containerId,
  };

  const configs = [
    { key: 'left' as const, fallback: 18 + options.btnWidth },
    { key: 'right' as const, fallback: 18 + options.btnWidth },
    { key: 'top' as const, fallback: 10 },
    { key: 'bottom' as const, fallback: 10 },
  ] as const;

  for (const { key, fallback } of configs) {
    if (options.position.includes(key)) {
      result[key] = fallback;
    }
  }

  return result;
}

/** Resolve a `#id` or bare id to an element (SSR-safe). */
export function queryModuleHostElement(
  selectorOrId: string,
): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  const raw = selectorOrId.startsWith('#')
    ? selectorOrId.slice(1)
    : selectorOrId;
  if (!raw) return null;
  return document.getElementById(raw);
}
