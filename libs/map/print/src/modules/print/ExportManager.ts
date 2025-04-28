import type { MapSimple } from '@hungpvq/shared-map';
import { Map as MaplibreMap } from 'maplibre-gl';

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
    // attributionControl: false,
    // hack to read transform request callback function
    // eslint-disable-next-line
    // @ts-ignore
    transformRequest: (map as unknown)._requestManager._transformRequestFn,
  });
  // the below code was added by https://github.com/watergis/maplibre-gl-export/pull/18.
  const images = ((map as MaplibreMap).style.imageManager || {}).images || [];
  Object.keys(images).forEach((key) => {
    if (!images[key].data) return;
    renderMap.addImage(key, images[key].data);
  });
  return { renderMap, hidden };
}
