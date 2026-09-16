import type { LngLatBoundsLike, PaddingOptions } from 'maplibre-gl';
import { bbox as turfBbox } from '@turf/turf';
import { isValidBbox } from './bbox';
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
   * Default: inset plus open left/right sidebar width.
   */
  padding?: number | PaddingOptions;
  /** When true, skip sidebar padding (flat inset only). */
  ignoreOverlays?: boolean;
  /**
   * Optional map id (kept for call-site compatibility; padding is DOM-only).
   * @deprecated Not used for padding.
   */
  mapId?: string;
}

export type GeojsonBbox = [number, number, number, number];

const DEFAULT_INSET = 50;

type EdgePadding = Required<PaddingOptions>;

function basePadding(inset: number): EdgePadding {
  return { top: inset, bottom: inset, left: inset, right: inset };
}

function resolveMapShell(container: HTMLElement): HTMLElement {
  return (
    (container.closest('.map-viewer') as HTMLElement | null) ||
    (container.closest('.map-container') as HTMLElement | null) ||
    container.parentElement ||
    container
  );
}

function sidebarWidth(node: HTMLElement, mapRect: DOMRect): number {
  const rect = node.getBoundingClientRect();
  if (rect.width < 8 || rect.height < 8) return 0;
  const overlapW =
    Math.min(rect.right, mapRect.right) - Math.max(rect.left, mapRect.left);
  return overlapW > 0 ? overlapW : 0;
}

/**
 * Padding = base inset + open left/right sidebar widths only.
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
  let left = 0;
  let right = 0;

  shell
    .querySelectorAll('.sidebar-container.show.expand')
    .forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden') return;
      if (style.opacity === '0') return;

      const w = sidebarWidth(node, mapRect);
      if (!w) return;
      if (node.classList.contains('right-sidebar-container')) {
        right = Math.max(right, w);
      } else if (node.classList.contains('left-sidebar-container')) {
        left = Math.max(left, w);
      }
    });

  return {
    top: inset,
    bottom: inset,
    left: inset + left,
    right: inset + right,
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

/**
 * GeoJSON bbox `[minLng, minLat, maxLng, maxLat]` via Turf, or undefined if empty.
 */
export function bboxFromGeojson(
  feature: Geometry | Feature | FeatureCollection,
): GeojsonBbox | undefined {
  if (!feature) return undefined;
  try {
    const box = turfBbox(feature as never);
    if (!isValidBbox(box)) return undefined;
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
