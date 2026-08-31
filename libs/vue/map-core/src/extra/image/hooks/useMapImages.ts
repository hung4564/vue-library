import { type MapSimple, styleImageToDataURL } from '@hungpvq/map-core';
import type { StyleImage } from 'maplibre-gl';
import { onBeforeUnmount, onMounted, shallowRef } from 'vue';
import { getMap } from '../../../store';

export function useMapImages(mapId: string) {
  const images = shallowRef<Record<string, StyleImage>>({});
  const loadImages = (map: MapSimple) => {
    if (!map) return;
    const names = map.listImages();
    const result: Record<string, maplibregl.StyleImage> = {};
    names.forEach((name: string) => {
      const img = map.getImage(name);
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
  return {
    images,
    reload,
    toDataURL: styleImageToDataURL,
  };
}

