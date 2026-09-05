/**
 * Framework-agnostic image utilities for MapLibre GL JS
 */

import type { StyleImage } from 'maplibre-gl';
import type { MapSimple } from '../types';

/**
 * Image options for MapLibre GL JS addImage
 */
export interface ImageOptions {
  pixelRatio?: number;
  sdf?: boolean;
  stretchX?: [number, number][];
  stretchY?: [number, number][];
  content?: [number, number, number, number];
}

/**
 * Loads an image from a URL
 *
 * @param url - The image URL to load
 * @returns Promise that resolves with the loaded HTMLImageElement
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return loadImageViaTag(url);
}

/**
 * Internal function to load image via HTML Image tag
 */
function loadImageViaTag(url: string): Promise<HTMLImageElement> {
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (e) => {
      reject(e);
    };
    img.src = url;
  });
  return promise;
}

/**
 * Adds an image to a MapLibre GL JS map instance
 *
 * @param map - The map instance
 * @param key - Unique identifier for the image
 * @param url - The image URL to load
 * @param option - Optional image options (e.g., pixelRatio, sdf)
 * @returns Promise that resolves to true when image is added
 */
export async function addImageForMap(
  map: MapSimple,
  key: string,
  url: string,
  option: ImageOptions = {},
): Promise<boolean> {
  const image = await map.loadImage(url);

  if (!map.hasImage(key)) map.addImage(key, image.data, option);
  return true;
}

/**
 * Convert MapLibre StyleImage RGBA data to ImageData
 */
export function toImageDataFromRGBAImage(
  rgbaImage: StyleImage['data'],
): ImageData {
  const { width, height, data } = rgbaImage;
  const clampedData = new Uint8ClampedArray(data);
  return new ImageData(clampedData, width, height);
}

const styleImageDataUrlCache: Record<string, string> = {};

/**
 * Convert a MapLibre StyleImage to a PNG data URL (cached by id)
 */
export function styleImageToDataURL(id: string, imageData: StyleImage): string {
  if (styleImageDataUrlCache[id]) {
    return styleImageDataUrlCache[id];
  }
  const rgbaImage = imageData.data;
  const image = toImageDataFromRGBAImage(rgbaImage);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  canvas.width = rgbaImage.width;
  canvas.height = rgbaImage.height;
  ctx.putImageData(image, 0, 0);
  const imageUrl = canvas.toDataURL('image/png');
  styleImageDataUrlCache[id] = imageUrl;
  return imageUrl;
}
