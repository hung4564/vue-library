/**
 * Framework-agnostic image utilities for MapLibre GL JS
 */

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
