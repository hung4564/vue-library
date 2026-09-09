import type { LngLatBoundsLike, PaddingOptions } from 'maplibre-gl';
import { bbox as turfBbox } from '@turf/turf';
import { UniversalRegistry } from '../registry/universal-registry';
import type {
  CoordinatesNumber,
  Feature,
  FeatureCollection,
  Geometry,
  MapSimple,
} from '../types';

/**
 * Fit bounds value type
 */
type FitBoundsValue =
  | LngLatBoundsLike
  | [CoordinatesNumber, CoordinatesNumber]
  | Geometry
  | Feature
  | FeatureCollection
  | CoordinatesNumber[]
  | null;

/**
 * Fit bounds options
 */
export interface FitBoundsOptions {
  zoom?: number;
  /**
   * Padding for MapLibre `fitBounds`.
   * Default: inset plus open overlays so the target stays in the visible area.
   */
  padding?: number | PaddingOptions;
  /** When true, skip measuring open overlays (flat inset only). */
  ignoreOverlays?: boolean;
  /**
   * Map id for registry-based overlay padding.
   * When set with `controlIds`, open matching controls contribute estimated edge padding.
   */
  mapId?: string;
  /** Limit registry padding to these control ids (requires `mapId`). */
  controlIds?: string[];
}

export type GeojsonBbox = [number, number, number, number];

const DEFAULT_INSET = 50;
/** Keep at least this much map visible on a side after overlay padding. */
const MIN_VISIBLE_PX = 120;
/** Fallback width/height when registry knows a control is open but DOM is missing. */
const REGISTRY_SIDEBAR_PX = 360;
const REGISTRY_FLOAT_PX = 320;
/** Fallback when a popup/control is open but DOM metrics are missing. */
const REGISTRY_POPUP_PX = 360;
/** Large bottom-sheet style popups (attribute table / identify / detail). */
const REGISTRY_LARGE_POPUP_PX = 420;

type EdgePadding = Required<PaddingOptions>;
type EdgeAcc = { left: number; right: number; top: number; bottom: number };

function basePadding(inset: number): EdgePadding {
  return { top: inset, bottom: inset, left: inset, right: inset };
}

function emptyEdges(): EdgeAcc {
  return { left: 0, right: 0, top: 0, bottom: 0 };
}

function clampOverlay(
  overlayPx: number,
  axisSize: number,
  inset: number,
): number {
  if (!(overlayPx > 0) || !(axisSize > 0)) return 0;
  const max = Math.max(
    inset,
    axisSize - Math.max(MIN_VISIBLE_PX, axisSize * 0.3),
  );
  return Math.min(overlayPx, max);
}

function resolveMapShell(container: HTMLElement): HTMLElement {
  return (
    (container.closest('.map-viewer') as HTMLElement | null) ||
    (container.closest('.map-container') as HTMLElement | null) ||
    container.parentElement ||
    container
  );
}

function accumulateNearestEdge(
  edges: EdgeAcc,
  mapRect: DOMRect,
  rect: DOMRect,
  overlapW: number,
  overlapH: number,
  force?: 'left' | 'right' | 'top' | 'bottom',
) {
  if (force === 'left') {
    edges.left = Math.max(edges.left, overlapW);
    return;
  }
  if (force === 'right') {
    edges.right = Math.max(edges.right, overlapW);
    return;
  }
  if (force === 'top') {
    edges.top = Math.max(edges.top, overlapH);
    return;
  }
  if (force === 'bottom') {
    edges.bottom = Math.max(edges.bottom, overlapH);
    return;
  }

  const distLeft = Math.abs(rect.left - mapRect.left);
  const distRight = Math.abs(rect.right - mapRect.right);
  const distTop = Math.abs(rect.top - mapRect.top);
  const distBottom = Math.abs(rect.bottom - mapRect.bottom);
  const nearest = Math.min(distLeft, distRight, distTop, distBottom);
  if (nearest === distLeft) edges.left = Math.max(edges.left, overlapW);
  else if (nearest === distRight) edges.right = Math.max(edges.right, overlapW);
  else if (nearest === distTop) edges.top = Math.max(edges.top, overlapH);
  else edges.bottom = Math.max(edges.bottom, overlapH);
}

function measureOverlappingNode(
  edges: EdgeAcc,
  mapRect: DOMRect,
  node: HTMLElement,
  force?: 'left' | 'right' | 'top' | 'bottom',
) {
  const rect = node.getBoundingClientRect();
  if (rect.width < 8 || rect.height < 8) return;

  const overlapW =
    Math.min(rect.right, mapRect.right) - Math.max(rect.left, mapRect.left);
  const overlapH =
    Math.min(rect.bottom, mapRect.bottom) - Math.max(rect.top, mapRect.top);
  if (overlapW <= 0 || overlapH <= 0) return;

  if (node.classList.contains('left-sidebar-container')) {
    accumulateNearestEdge(edges, mapRect, rect, overlapW, overlapH, 'left');
  } else if (node.classList.contains('right-sidebar-container')) {
    accumulateNearestEdge(edges, mapRect, rect, overlapW, overlapH, 'right');
  } else if (node.classList.contains('top-sidebar-container')) {
    accumulateNearestEdge(edges, mapRect, rect, overlapW, overlapH, 'top');
  } else if (
    node.classList.contains('bottom-sidebar-container') ||
    node.classList.contains('bottom-container')
  ) {
    accumulateNearestEdge(edges, mapRect, rect, overlapW, overlapH, 'bottom');
  } else if (
    node.classList.contains('draggable-popup-wrapper') ||
    node.classList.contains('popup-mobile-container')
  ) {
    // Tall / wide popups (attribute table, identify) — prefer bottom padding.
    const forceBottom =
      overlapH >= mapRect.height * 0.35 || overlapW >= mapRect.width * 0.55;
    accumulateNearestEdge(
      edges,
      mapRect,
      rect,
      overlapW,
      overlapH,
      forceBottom ? 'bottom' : force,
    );
  } else {
    accumulateNearestEdge(edges, mapRect, rect, overlapW, overlapH, force);
  }
}

function accumulateFromDom(shell: HTMLElement, mapRect: DOMRect): EdgeAcc {
  const edges = emptyEdges();
  const selectors = [
    '.sidebar-container.show.expand',
    '.float-container',
    '.draggable-popup-wrapper',
    '.popup-mobile-container.bottom-container',
    '.bottom-container.show',
  ];
  for (const selector of selectors) {
    shell.querySelectorAll(selector).forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden') return;
      if (style.opacity === '0') return;
      measureOverlappingNode(edges, mapRect, node);
    });
  }
  return edges;
}

function accumulateFromRegistry(
  mapId: string | undefined,
  controlIds: string[] | undefined,
): EdgeAcc {
  const edges = emptyEdges();
  if (!mapId) return edges;
  try {
    const controls = UniversalRegistry.listControls(mapId);
    const allow = controlIds?.length ? new Set(controlIds) : null;
    for (const ctrl of controls) {
      if (allow && !allow.has(ctrl.id)) continue;
      if (!ctrl.isOpen() || ctrl.panelKind === 'button') continue;
      const location = ctrl.getPanelPosition?.()?.location;
      if (ctrl.panelKind === 'sidebar') {
        const px = REGISTRY_SIDEBAR_PX;
        if (location === 'right') edges.right = Math.max(edges.right, px);
        else if (location === 'top') edges.top = Math.max(edges.top, px);
        else if (location === 'bottom') edges.bottom = Math.max(edges.bottom, px);
        else edges.left = Math.max(edges.left, px);
      } else if (ctrl.panelKind === 'float') {
        edges.left = Math.max(edges.left, REGISTRY_FLOAT_PX);
  } else if (ctrl.panelKind === 'popup') {
        const largeIds = new Set([
          'mapAttributeTable',
          'mapIdentifyResultControl',
          'mapLayerDetail',
          'mapCreateControl',
        ]);
        const px = largeIds.has(ctrl.id)
          ? REGISTRY_LARGE_POPUP_PX
          : REGISTRY_POPUP_PX;
        edges.bottom = Math.max(edges.bottom, px);
      }
    }
  } catch {
    // Registry may be unavailable in non-map contexts.
  }
  return edges;
}

function mergeEdges(a: EdgeAcc, b: EdgeAcc): EdgeAcc {
  return {
    left: Math.max(a.left, b.left),
    right: Math.max(a.right, b.right),
    top: Math.max(a.top, b.top),
    bottom: Math.max(a.bottom, b.bottom),
  };
}

/**
 * Measure open overlays (sidebar / float / popup / bottom) overlapping the map
 * and build fitBounds padding so the camera centers on the remaining visible region.
 */
export function getMapFitBoundsPadding(
  map: MapSimple,
  inset: number = DEFAULT_INSET,
  options: Pick<FitBoundsOptions, 'mapId' | 'controlIds'> = {},
): EdgePadding {
  const padding = basePadding(inset);
  if (typeof document === 'undefined') return padding;

  const container =
    typeof map.getContainer === 'function' ? map.getContainer() : null;
  if (!container) return padding;

  const mapRect = container.getBoundingClientRect();
  if (!(mapRect.width > 0) || !(mapRect.height > 0)) return padding;

  const shell = resolveMapShell(container);
  const edges = mergeEdges(
    accumulateFromDom(shell, mapRect),
    accumulateFromRegistry(options.mapId, options.controlIds),
  );

  return {
    top: inset + clampOverlay(edges.top, mapRect.height, inset),
    bottom: inset + clampOverlay(edges.bottom, mapRect.height, inset),
    left: inset + clampOverlay(edges.left, mapRect.width, inset),
    right: inset + clampOverlay(edges.right, mapRect.width, inset),
  };
}

function resolvePadding(
  map: MapSimple,
  options: FitBoundsOptions,
): number | PaddingOptions {
  if (options.padding != null) return options.padding;
  if (options.ignoreOverlays) return DEFAULT_INSET;
  return getMapFitBoundsPadding(map, DEFAULT_INSET, {
    mapId: options.mapId,
    controlIds: options.controlIds,
  });
}

/**
 * Fit bounds to map
 */
export function fitBounds(
  map: MapSimple,
  value: FitBoundsValue,
  { zoom = 15, ...rest }: FitBoundsOptions = {},
) {
  if (!map || !value) {
    return;
  }

  let bounds: LngLatBoundsLike | undefined;

  if (
    Array.isArray(value) &&
    value.length === 2 &&
    Array.isArray(value[0]) &&
    Array.isArray(value[1])
  ) {
    // [lng, lat] pair format
    bounds = [value[0] as [number, number], value[1] as [number, number]];
  } else if (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'number'
  ) {
    // Coordinates array format
    bounds = getBBox(convertGeometry(value as CoordinatesNumber[]));
  } else if (
    typeof value === 'object' &&
    'type' in value &&
    ('coordinates' in value || 'geometry' in value || 'features' in value)
  ) {
    // GeoJSON format
    bounds = getBBox(value as Geometry | Feature | FeatureCollection);
  } else if (
    Array.isArray(value) &&
    value.length === 2 &&
    (Array.isArray(value[0]) || typeof value[0] === 'number')
  ) {
    // LngLatBoundsLike format
    bounds = value as LngLatBoundsLike;
  }

  if (bounds) {
    map.fitBounds(bounds, {
      padding: resolvePadding(map, rest),
      duration: 0,
      maxZoom: zoom,
    });
  }
}

function isValidTurfBbox(box: number[]): box is GeojsonBbox {
  return (
    box.length === 4 &&
    box.every((n) => typeof n === 'number' && Number.isFinite(n))
  );
}

/**
 * GeoJSON bbox `[minLng, minLat, maxLng, maxLat]` via Turf, or undefined if empty.
 */
export function bboxFromGeojson(
  feature: Geometry | Feature | FeatureCollection,
): GeojsonBbox | undefined {
  if (!feature) return undefined;
  try {
    const box = turfBbox(feature as never);
    if (!isValidTurfBbox(box)) return undefined;
    return [box[0], box[1], box[2], box[3]];
  } catch {
    return undefined;
  }
}

/**
 * Get bounding box as MapLibre `[[sw], [ne]]`.
 */
function getBBox(
  feature: Geometry | Feature | FeatureCollection,
): LngLatBoundsLike | undefined {
  const box = bboxFromGeojson(feature);
  if (!box) return undefined;
  return [
    [box[0], box[1]],
    [box[2], box[3]],
  ];
}

/**
 * Convert coordinates to geometry
 */
export function convertGeometry(
  coordinates: CoordinatesNumber[],
  properties: Record<string, unknown> = {},
): Feature {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: coordinates,
    },
    properties,
  };
}
