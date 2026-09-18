/**
 * Framework-agnostic print/export utilities for MapLibre GL JS
 */

import type { MapSimple } from '../types';
import { Map as MaplibreMap } from 'maplibre-gl';

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
  /**
   * Print DPI hint. When `pixelRatio` is omitted, converted as `dpi / 96`
   * (capped the same way as {@link resolveExportPixelRatio}).
   */
  dpi?: number;
  /**
   * Canvas buffer scale (default `devicePixelRatio`, capped at 3).
   * Applied when reading the map canvas for clip/export.
   */
  pixelRatio?: number;
};

function resolveExportPixelRatio(
  explicit?: number,
  dpi?: number,
): number {
  const fromDpi =
    typeof dpi === 'number' && dpi > 0 ? dpi / 96 : undefined;
  const dpr =
    typeof explicit === 'number' && explicit > 0
      ? explicit
      : typeof fromDpi === 'number'
        ? fromDpi
        : typeof devicePixelRatio === 'number' && devicePixelRatio > 0
          ? devicePixelRatio
          : 1;
  return Math.min(3, Math.max(1, dpr));
}

/**
 * Clip a region from a source canvas (CSS px coords → buffer coords).
 */
export function clipCanvasRegion(
  source: HTMLCanvasElement,
  region: { startX: number; startY: number; width: number; height: number },
  pixelRatio = 1,
): HTMLCanvasElement {
  const scaleX = source.width / Math.max(1, source.clientWidth || source.width);
  const scaleY =
    source.height / Math.max(1, source.clientHeight || source.height);
  const sx = Math.max(0, Math.round(region.startX * scaleX));
  const sy = Math.max(0, Math.round(region.startY * scaleY));
  const sw = Math.max(1, Math.round(region.width * scaleX));
  const sh = Math.max(1, Math.round(region.height * scaleY));
  const out = document.createElement('canvas');
  out.width = Math.max(1, Math.round(region.width * pixelRatio));
  out.height = Math.max(1, Math.round(region.height * pixelRatio));
  const ctx = out.getContext('2d');
  if (!ctx) return out;
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, out.width, out.height);
  return out;
}

/**
 * Export the map and save via a host-provided saver (e.g. `file-saver` `saveAs`).
 * Keeps PrintControl Vue/React thin around export + download.
 */
export async function printMapToFile(
  map: MapSimple,
  options: {
    fileName?: string;
    save: (dataUrl: string, fileName: string) => void | Promise<void>;
    exportOptions?: ExportMapboxOptions;
    /** Test / override hook; defaults to {@link exportMapbox}. */
    exportMap?: (
      map: MapSimple,
      options?: ExportMapboxOptions,
    ) => Promise<string>;
  },
): Promise<string> {
  const runExport = options.exportMap ?? exportMapbox;
  const dataUrl = await runExport(map, options.exportOptions);
  const fileName = `${options.fileName ?? 'map'}.png`;
  await options.save(dataUrl, fileName);
  return dataUrl;
}

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
    const finish = async () => {
      await waitMapIdleAndTiles(renderMap as unknown as MapSimple);
      const canvas = renderMap.getCanvas();
      const dataUrl = options.watermark
        ? applyCanvasWatermark(canvas, options.watermark)
        : canvas.toDataURL();
      resolve(dataUrl);
      renderMap.remove();
      hidden.parentNode?.removeChild(hidden);
    };
    renderMap.once('idle', () => {
      void finish();
    });
  });
}

/**
 * Export map as image data URL with custom cutout (CSS px on the visible canvas).
 * Honors {@link startX}/{@link startY} crop and optional {@link pixelRatio}.
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
    pixelRatio?: number;
  },
): Promise<string> {
  await waitMapIdleAndTiles(map);
  const pixelRatio = resolveExportPixelRatio(options.pixelRatio, options.dpi);
  const mapCanvas = map.getCanvas();
  const { renderMap, hidden } = getMapBoxCanvas(map, (container) => {
    container.style.width = mapCanvas.clientWidth + 'px';
    container.style.height = mapCanvas.clientHeight + 'px';
  });
  return new Promise((resolve) => {
    const finish = async () => {
      await waitMapIdleAndTiles(renderMap as unknown as MapSimple);
      const canvas = renderMap.getCanvas();
      const clipped = clipCanvasRegion(
        canvas,
        {
          startX: options.startX,
          startY: options.startY,
          width: options.width,
          height: options.height,
        },
        pixelRatio,
      );
      const dataUrl = options.watermark
        ? applyCanvasWatermark(clipped, options.watermark)
        : clipped.toDataURL();
      resolve(dataUrl);
      renderMap.remove();
      hidden.parentNode?.removeChild(hidden);
    };
    renderMap.once('idle', () => {
      void finish();
    });
  });
}
