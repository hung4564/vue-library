import type {
  MapControlPanelKind,
  MapControlPanelPosition,
} from '../registry/control';
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

/**
 * Effective panel offsets / dock for Registry inspect + setPanelPosition.
 * Popup/float default to ModuleContainer corner bind; overrides win.
 */
export function resolveEffectivePanelPosition(options: {
  panelKind: MapControlPanelKind;
  buttonCorner: Position;
  overrides?: MapControlPanelPosition;
  btnWidth?: number;
}): MapControlPanelPosition {
  const overrides = options.overrides ?? {};
  if (options.panelKind === 'sidebar') {
    return { location: overrides.location ?? 'left' };
  }
  if (options.panelKind === 'button') {
    return { ...overrides };
  }
  const bind = buildModuleBindPosition({
    position: options.buttonCorner,
    btnWidth: options.btnWidth ?? 40,
    containerId: '_',
  });
  return {
    ...(bind.top != null ? { top: bind.top } : {}),
    ...(bind.left != null ? { left: bind.left } : {}),
    ...(bind.right != null ? { right: bind.right } : {}),
    ...(bind.bottom != null ? { bottom: bind.bottom } : {}),
    ...overrides,
  };
}

export type PanelBoundsRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PanelContainerSize = {
  width: number;
  height: number;
};

/** Convert drag-layout bounds (x/y/w/h) to edge offsets for Registry / panel API. */
export function panelPositionFromBounds(
  bounds: PanelBoundsRect,
  container: PanelContainerSize,
): MapControlPanelPosition {
  const cw = Math.max(0, container.width);
  const ch = Math.max(0, container.height);
  return {
    left: bounds.x,
    top: bounds.y,
    right: Math.max(0, cw - bounds.x - bounds.width),
    bottom: Math.max(0, ch - bounds.y - bounds.height),
  };
}

/**
 * Convert edge offsets (+ size) to drag-layout bounds.
 * Missing left/top fall back to right/bottom + size against the container.
 */
export function boundsFromPanelPosition(
  pos: MapControlPanelPosition,
  size: { width: number; height: number },
  container: PanelContainerSize,
  fallback?: Partial<PanelBoundsRect>,
): PanelBoundsRect {
  const width = size.width > 0 ? size.width : (fallback?.width ?? 200);
  const height = size.height > 0 ? size.height : (fallback?.height ?? 200);
  const cw = Math.max(0, container.width);
  const ch = Math.max(0, container.height);

  let x: number;
  if (pos.left != null) {
    x = pos.left;
  } else if (pos.right != null) {
    x = cw - pos.right - width;
  } else {
    x = fallback?.x ?? 0;
  }

  let y: number;
  if (pos.top != null) {
    y = pos.top;
  } else if (pos.bottom != null) {
    y = ch - pos.bottom - height;
  } else {
    y = fallback?.y ?? 0;
  }

  return { x, y, width, height };
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
