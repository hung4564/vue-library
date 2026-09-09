/**
 * Framework-agnostic print/export utilities for MapLibre GL JS
 */

import type { MapSimple } from '../types';
import { Map as MaplibreMap } from 'maplibre-gl';

/**
 * Convert length to pixels string
 *
 * @param length - Length value
 * @param conversionFactor - Conversion factor (default: 96 DPI)
 * @returns Pixel string (e.g., "192px")
 */
function toPixels(length: number, conversionFactor = 96): string {
  return `${conversionFactor * length}px`;
}

/**
 * Get a hidden map canvas for rendering/export purposes
 *
 * @param map - The map instance
 * @param callback - Callback to configure the container element
 * @returns Object containing the render map and hidden container
 */
export function getMapBoxCanvas(
  map: MapSimple,
  callback: (container: HTMLElement) => void,
): { renderMap: MaplibreMap; hidden: HTMLElement } {
  const hidden = document.createElement('div');
  hidden.style.position = 'fixed';
  hidden.style.top = '0';
  hidden.style.left = '0';
  hidden.style.padding = '0';
  hidden.style.margin = '0';
  hidden.style.background = 'transparent';
  hidden.style.zIndex = '-1';
  document.body.appendChild(hidden);
  const container = document.createElement('div');
  callback(container);
  hidden.appendChild(container);
  const renderMap: MaplibreMap = new MaplibreMap({
    container,
    style: map.getStyle(),
    center: map.getCenter(),
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
    interactive: false,
    canvasContextAttributes: {
      preserveDrawingBuffer: true,
    },
    fadeDuration: 0,
    // hack to read transform request callback function
    // eslint-disable-next-line
    // @ts-ignore
    transformRequest: (map as unknown)._requestManager._transformRequestFn,
  });
  // Copy images from original map to render map
  const images = ((map as MaplibreMap).style.imageManager || {}).images || [];
  Object.keys(images).forEach((key) => {
    if (!images[key].data) return;
    renderMap.addImage(key, images[key].data);
  });
  return { renderMap, hidden };
}

/**
 * Wait until the map reports loaded and (when available) tiles are loaded.
 */
export function waitMapIdleAndTiles(
  map: MapSimple,
  max = 100,
): Promise<boolean> {
  const check = (
    resolve: (value: boolean | PromiseLike<boolean>) => void,
    index = 1,
  ) => {
    const tilesOk =
      typeof (map as { areTilesLoaded?: () => boolean }).areTilesLoaded !==
      'function'
        ? true
        : Boolean((map as { areTilesLoaded: () => boolean }).areTilesLoaded());
    if (map.loaded() && tilesOk) resolve(true);
    else if (index === max) resolve(true);
    else setTimeout(() => check(resolve, ++index), 100);
  };
  return new Promise((resolve) => check(resolve, 1));
}

/** @deprecated Prefer `waitMapIdleAndTiles` (also checks tiles when available). */
export function waitMapLoadDone(map: MapSimple, max = 100): Promise<boolean> {
  return waitMapIdleAndTiles(map, max);
}

function applyCanvasWatermark(
  source: HTMLCanvasElement,
  watermark: string,
): string {
  const out = document.createElement('canvas');
  out.width = source.width;
  out.height = source.height;
  const ctx = out.getContext('2d');
  if (!ctx) return source.toDataURL();
  ctx.drawImage(source, 0, 0);
  const size = Math.max(12, Math.round(out.width / 48));
  ctx.font = `${size}px sans-serif`;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(watermark, out.width - 12, out.height - 12);
  return out.toDataURL();
}

export type ExportMapboxOptions = {
  /** Optional corner watermark painted after tiles idle. */
  watermark?: string;
  /** Pixel density hint for advanced export width/height conversion (default 96). */
  dpi?: number;
};

/**
 * Export map as image data URL
 */
export async function exportMapbox(
  map: MapSimple,
  options: ExportMapboxOptions = {},
): Promise<string> {
  await waitMapIdleAndTiles(map);
  const { renderMap, hidden } = getMapBoxCanvas(map, (container) => {
    const canvas = map.getCanvas();
    container.style.width = canvas.clientWidth + 'px';
    container.style.height = canvas.clientHeight + 'px';
  });
  return new Promise((resolve) => {
    renderMap.once('idle', () => {
      const canvas = renderMap.getCanvas();
      const dataUrl = options.watermark
        ? applyCanvasWatermark(canvas, options.watermark)
        : canvas.toDataURL();
      resolve(dataUrl);
      renderMap.remove();
      hidden.parentNode?.removeChild(hidden);
    });
  });
}

/**
 * Export map as image data URL with custom dimensions and position
 */
export async function exportMapboxWithOptions(
  map: MapSimple,
  options: {
    width: number;
    height: number;
    startX: number;
    startY: number;
    watermark?: string;
    dpi?: number;
  },
): Promise<string> {
  await waitMapIdleAndTiles(map);
  const dpi = options.dpi ?? 96;
  const { renderMap, hidden } = getMapBoxCanvas(map, (container) => {
    container.style.width = toPixels(+options.width, dpi / 96);
    container.style.height = toPixels(+options.height, dpi / 96);
  });
  return new Promise((resolve) => {
    renderMap.once('idle', () => {
      const canvas = renderMap.getCanvas();
      const dataUrl = options.watermark
        ? applyCanvasWatermark(canvas, options.watermark)
        : canvas.toDataURL();
      resolve(dataUrl);
      renderMap.remove();
      hidden.parentNode?.removeChild(hidden);
    });
  });
}
