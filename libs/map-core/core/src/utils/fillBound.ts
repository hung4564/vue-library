import type { LngLatBoundsLike, PaddingOptions } from 'maplibre-gl';
import { bbox as turfBbox } from '@turf/turf';
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
   * Default: inset plus open map sidebars so the target stays in the visible area.
   */
  padding?: number | PaddingOptions;
  /** When true, skip measuring open sidebars (flat inset only). */
  ignoreOverlays?: boolean;
}

export type GeojsonBbox = [number, number, number, number];

const DEFAULT_INSET = 50;
/** Keep at least this much map visible on a side after overlay padding. */
const MIN_VISIBLE_PX = 120;

type EdgePadding = Required<PaddingOptions>;

function basePadding(inset: number): EdgePadding {
  return { top: inset, bottom: inset, left: inset, right: inset };
}

function clampOverlay(
  overlayPx: number,
  axisSize: number,
  inset: number,
): number {
  if (!(overlayPx > 0) || !(axisSize > 0)) return 0;
  const max = Math.max(inset, axisSize - Math.max(MIN_VISIBLE_PX, axisSize * 0.3));
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

/**
 * Measure open expanded sidebars overlapping the map and build fitBounds padding
 * so the camera centers on the remaining visible region.
 */
export function getMapFitBoundsPadding(
  map: MapSimple,
  inset: number = DEFAULT_INSET,
): EdgePadding {
  const padding = basePadding(inset);
  if (typeof document === 'undefined') return padding;

  const container =
    typeof map.getContainer === 'function' ? map.getContainer() : null;
  if (!container) return padding;

  const mapRect = container.getBoundingClientRect();
  if (!(mapRect.width > 0) || !(mapRect.height > 0)) return padding;

  const shell = resolveMapShell(container);
  const sidebars = shell.querySelectorAll(
    '.sidebar-container.show.expand',
  );

  let left = 0;
  let right = 0;
  let top = 0;
  let bottom = 0;

  sidebars.forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    const rect = node.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return;

    const overlapW =
      Math.min(rect.right, mapRect.right) - Math.max(rect.left, mapRect.left);
    const overlapH =
      Math.min(rect.bottom, mapRect.bottom) - Math.max(rect.top, mapRect.top);
    if (overlapW <= 0 || overlapH <= 0) return;

    if (node.classList.contains('left-sidebar-container')) {
      left = Math.max(left, overlapW);
    } else if (node.classList.contains('right-sidebar-container')) {
      right = Math.max(right, overlapW);
    } else if (node.classList.contains('top-sidebar-container')) {
      top = Math.max(top, overlapH);
    } else if (node.classList.contains('bottom-sidebar-container')) {
      bottom = Math.max(bottom, overlapH);
    } else {
      // Fallback: stick to nearest map edge
      const distLeft = Math.abs(rect.left - mapRect.left);
      const distRight = Math.abs(rect.right - mapRect.right);
      const distTop = Math.abs(rect.top - mapRect.top);
      const distBottom = Math.abs(rect.bottom - mapRect.bottom);
      const nearest = Math.min(distLeft, distRight, distTop, distBottom);
      if (nearest === distLeft) left = Math.max(left, overlapW);
      else if (nearest === distRight) right = Math.max(right, overlapW);
      else if (nearest === distTop) top = Math.max(top, overlapH);
      else bottom = Math.max(bottom, overlapH);
    }
  });

  return {
    top: inset + clampOverlay(top, mapRect.height, inset),
    bottom: inset + clampOverlay(bottom, mapRect.height, inset),
    left: inset + clampOverlay(left, mapRect.width, inset),
    right: inset + clampOverlay(right, mapRect.width, inset),
  };
}

function resolvePadding(
  map: MapSimple,
  options: FitBoundsOptions,
): number | PaddingOptions {
  if (options.padding != null) return options.padding;
  if (options.ignoreOverlays) return DEFAULT_INSET;
  return getMapFitBoundsPadding(map, DEFAULT_INSET);
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
