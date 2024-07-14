import type { MapSimple } from '@hungpvq/shared-map';
import maplibregl from 'mapbox-gl';

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
export async function exportMapboxWithOptions(
  map: MapSimple,
  options: {
    width: number;
    height: number;
    startX: number;
    startY: number;
  }
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

export function waitMapLoadDone(map: MapSimple, max = 100) {
  const check = (resolve: any, index = 1) => {
    if (map.loaded()) resolve(true);
    else if (index === max) {
      resolve(true);
    } else setTimeout(() => check(resolve, ++index), 100);
  };

  return new Promise((resolve) => check(resolve, 1));
}
function toPixels(length: number, conversionFactor = 96) {
  return `${conversionFactor * length}px`;
}
function getMapBoxCanvas(
  map: MapSimple,
  callback: (container: HTMLElement) => void
) {
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
  const renderMap = new maplibregl.Map({
    container,
    center: map.getCenter(),
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
    interactive: false,
    preserveDrawingBuffer: true,
    fadeDuration: 0,
    attributionControl: false,
    // hack to read transfrom request callback function
    transformRequest: (map as any)._requestManager._transformRequestFn,
  });
  const images = ((map as any).style.imageManager || {}).images || {};
  if (images && Object.keys(images)?.length > 0) {
    Object.keys(images).forEach((key) => {
      if (!key) return;
      renderMap.addImage(key, images[key].data);
    });
  }
  const style = map.getStyle();
  if (style && style.sources) {
    const sources = style.sources;
    Object.keys(sources).forEach((name) => {
      const src = sources[name];
      Object.keys(src).forEach((key) => {
        // delete properties if value is undefined.
        // for instance, raster-dem might has undefined value in "url" and "bounds"
        // @ts-expect-error:next-line
        if (!src[key]) delete src[key];
      });
    });
  }
  renderMap.setStyle(style);
  return { renderMap, hidden };
}
