import { MapSimple } from '@hungpv97/shared-map';

export function loadImage(url: string) {
  return loadImageViaTag(url);
}
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

export function addImageForMap(
  map: MapSimple,
  key: string,
  url: string,
  option: any = {}
) {
  return new Promise((resolve, reject) => {
    map.loadImage(url, (error: any, image: any) => {
      if (error) reject(error);
      if (!map.hasImage(key)) map.addImage(key, image, option);
      resolve(true);
    });
  });
}
