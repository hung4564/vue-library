import {
  expression,
  latest,
  function as styleFunction,
} from '@maplibre/maplibre-gl-style-spec';
import type { LayerSpecification, Map as MapMaplibre } from 'maplibre-gl';
import type { ExprHandlerFn } from '../types/legend';

const PROP_MAP: [string, string?][] = [
  ['background'],
  ['circle'],
  ['fill-extrusion'],
  ['fill'],
  ['heatmap'],
  ['hillshade'],
  ['line'],
  ['raster'],
  ['icon', 'symbol'],
  ['text', 'symbol'],
];

interface ExprHandlerOptions {
  zoom: number;
}

export function exprHandler({ zoom }: ExprHandlerOptions): ExprHandlerFn {
  function prefixFromProp(prop: string): string | null {
    const out = PROP_MAP.find((def) => {
      const type = def[0];
      return prop.startsWith(type);
    });
    return out ? out[1] || out[0] : null;
  }

  return function (layer: LayerSpecification, type: string, prop: string): any {
    const prefix = prefixFromProp(prop);
    if (!prefix) return null;
    const specItem = (latest as any)[`${type}_${prefix}`]?.[prop];
    if (!specItem) return null;
    const dflt = specItem.default;

    const layerAny = layer as any;
    if (!layerAny[type]) {
      return dflt;
    }

    const input = layerAny[type][prop];
    if (typeof input === 'undefined') {
      return dflt;
    } else if (typeof input === 'object') {
      let expr: any;
      if (Array.isArray(input)) {
        if (specItem.type === 'array') {
          return input;
        } else {
          expr = (expression as any).createExpression(input).value;
        }
      } else {
        expr = (styleFunction as any).createFunction(input, specItem);
      }
      if (!expr || !expr.evaluate) {
        return null;
      }

      const result = expr.evaluate({ zoom }, {});
      return result?.name || result || null;
    } else {
      return input;
    }
  };
}

export function mapImageToDataURL(
  map: MapMaplibre,
  icon: string,
): string | undefined {
  if (!icon) return undefined;
  const styleAny = map.style as any;
  const image = styleAny.imageManager.images[icon];
  if (!image) return undefined;

  const canvasEl = document.createElement('canvas');
  canvasEl.width = image.data.width;
  canvasEl.height = image.data.height;
  const ctx = canvasEl.getContext('2d');
  if (!ctx) return undefined;

  ctx.putImageData(
    new ImageData(
      Uint8ClampedArray.from(image.data.data),
      image.data.width,
      image.data.height,
    ),
    0,
    0,
  );

  return canvasEl.toDataURL();
}

const dataStore = new Map<string, { value: any; count: number }>();

export const cache = {
  add: (key: string, value: any) => {
    if (dataStore.has(key)) {
      throw new Error(`Cache already contains '${key}'`);
    }
    dataStore.set(key, { value, count: 1 });
  },
  fetch: (key: string): any => {
    const cacheObj = dataStore.get(key);
    if (cacheObj) {
      cacheObj.count++;
      return cacheObj.value;
    }
  },
  release: (key: string) => {
    const cacheObj = dataStore.get(key);
    if (!cacheObj) {
      throw new Error(`No such key in cache '${key}'`);
    }
    cacheObj.count--;
    if (cacheObj.count === 0) {
      dataStore.delete(key);
    }
  },
};
