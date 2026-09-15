import { type MapSimple } from '@hungpvq/map-core';
import {
  listMapStyleImages,
  styleImageToDataURL,
  subscribeMapStyleImages,
} from '@hungpvq/map-core/image';
import type { StyleImage } from 'maplibre-gl';
import { onBeforeUnmount, onMounted, shallowRef } from 'vue';
import { getMap } from '../../../store/store';

export function useMapImages(mapId: string) {
  const images = shallowRef<Record<string, StyleImage>>({});
  let unsubscribe: (() => void) | undefined;

  const syncImages = (map: MapSimple) => {
    images.value = listMapStyleImages(map);
  };

  onMounted(() => {
    getMap(mapId, (map: MapSimple) => {
      syncImages(map);
      unsubscribe = subscribeMapStyleImages(map, () => syncImages(map));
    });
  });

  onBeforeUnmount(() => {
    unsubscribe?.();
    unsubscribe = undefined;
  });

  const reload = () => {
    unsubscribe?.();
    getMap(mapId, (map: MapSimple) => {
      syncImages(map);
      unsubscribe = subscribeMapStyleImages(map, () => syncImages(map));
    });
  };

  return {
    images,
    reload,
    toDataURL: styleImageToDataURL,
  };
}
