import { MapSimple } from '@hungpvq/shared-map';

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

export async function addImageForMap(
  map: MapSimple,
  key: string,
  url: string,
  option: any = {}
) {
  const image = await map.loadImage(url);

  if (!map.hasImage(key)) map.addImage(key, image.data, option);
  return true;
}
