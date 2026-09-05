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
 * Wait for map to finish loading
 *
 * @param map - The map instance
 * @param max - Maximum number of checks (default: 100)
 * @returns Promise that resolves when map is loaded or max checks reached
 */
export function waitMapLoadDone(map: MapSimple, max = 100): Promise<boolean> {
  const check = (
    resolve: (value: boolean | PromiseLike<boolean>) => void,
    index = 1,
  ) => {
    if (map.loaded()) resolve(true);
    else if (index === max) {
      resolve(true);
    } else setTimeout(() => check(resolve, ++index), 100);
  };

  return new Promise((resolve) => check(resolve, 1));
}

/**
 * Export map as image data URL
 *
 * @param map - The map instance
 * @returns Promise that resolves with the image data URL
 */
export function exportMapbox(map: MapSimple): Promise<string> {
  const { renderMap, hidden } = getMapBoxCanvas(map, (container) => {
    const canvas = map.getCanvas();
    container.style.width = canvas.clientWidth + 'px';
    container.style.height = canvas.clientHeight + 'px';
  });
  return new Promise((resolve) => {
    renderMap.once('idle', () => {
      const canvas = renderMap.getCanvas();

      resolve(canvas.toDataURL());
      renderMap.remove();
      hidden.parentNode?.removeChild(hidden);
    });
  });
}

/**
 * Export map as image data URL with custom dimensions and position
 *
 * @param map - The map instance
 * @param options - Export options
 * @param options.width - Width of the exported image
 * @param options.height - Height of the exported image
 * @param options.startX - Starting X position (currently unused but kept for compatibility)
 * @param options.startY - Starting Y position (currently unused but kept for compatibility)
 * @returns Promise that resolves with the image data URL
 */
export async function exportMapboxWithOptions(
  map: MapSimple,
  options: {
    width: number;
    height: number;
    startX: number;
    startY: number;
  },
): Promise<string> {
  const { renderMap, hidden } = getMapBoxCanvas(map, (container) => {
    container.style.width = toPixels(+options.width, 1);
    container.style.height = toPixels(+options.height, 1);
  });
  return new Promise((resolve) => {
    renderMap.once('idle', () => {
      const canvas = renderMap.getCanvas();

      resolve(canvas.toDataURL());
      renderMap.remove();
      hidden.parentNode?.removeChild(hidden);
    });
  });
}
