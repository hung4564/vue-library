import type { MapSimple } from '@hungpvq/shared-map';
import type { StyleImage } from 'maplibre-gl';
import { onBeforeUnmount, onMounted, shallowRef } from 'vue';
import { getMap } from '../../../store';
const cache: Record<string, string> = {};

export function useMapImages(mapId: string) {
  const images = shallowRef<Record<string, StyleImage>>({});
  const loadImages = (map: MapSimple) => {
    if (!map) return;
    const names = map.listImages();
    const result: Record<string, maplibregl.StyleImage> = {};
    names.forEach((name: string) => {
      const img = map!.getImage(name);
      if (img) {
        result[name] = img;
      }
    });
    images.value = result;
  };
  let handleMap: undefined | (() => void) = undefined;
  const setupListeners = (map: MapSimple) => {
    if (!map) return;
    handleMap = () => loadImages(map);
    map.on('styledata', handleMap);
    map.on('idle', handleMap);
  };

  const removeListeners = (map: MapSimple) => {
    if (!map) return;
    if (handleMap) {
      map.off('styledata', handleMap);
      map.off('idle', handleMap);
    }
  };

  onMounted(() => {
    getMap(mapId, (map: MapSimple) => {
      loadImages(map);
      setupListeners(map);
    });
  });

  onBeforeUnmount(() => {
    getMap(mapId, (map: MapSimple) => {
      removeListeners(map);
    });
  });
  const reload = () => {
    getMap(mapId, (map: MapSimple) => {
      loadImages(map);
      setupListeners(map);
    });
  };
  function toDataURL(id: string, imageData: StyleImage): string {
    if (cache[id]) {
      return cache[id];
    }

    // Chuyển đổi dữ liệu của StyleImage thành ImageData
    const rgbaImage = imageData.data;
    const image = toImageDataFromRGBAImage(rgbaImage);

    // Tạo Canvas và vẽ dữ liệu lên đó
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = rgbaImage.width;
    canvas.height = rgbaImage.height;

    // Vẽ ImageData vào canvas
    ctx.putImageData(image, 0, 0);

    // Tạo URL từ Canvas
    const imageUrl = canvas.toDataURL('image/png');
    cache[id] = imageUrl;

    return imageUrl;
  }
  return {
    images,
    reload,
    toDataURL,
  };
}
function toImageDataFromRGBAImage(rgbaImage: StyleImage['data']): ImageData {
  const { width, height, data } = rgbaImage;

  // Chuyển đổi từ Uint8Array sang Uint8ClampedArray
  const clampedData = new Uint8ClampedArray(data);

  // Tạo ImageData từ mảng dữ liệu clamped
  return new ImageData(clampedData, width, height);
}
