import { type MapSimple, subscribeMapReady } from '@hungpvq/map-core';
import {
  listMapStyleImages,
  styleImageToDataURL,
  subscribeMapStyleImages,
} from '@hungpvq/map-core/image';
import type { StyleImage } from 'maplibre-gl';
import { onBeforeUnmount, onMounted, shallowRef } from 'vue';

export function useMapImages(mapId: string) {
  const images = shallowRef<Record<string, StyleImage>>({});
  let unsubscribeReady: (() => void) | undefined;
  let unsubscribeImages: (() => void) | undefined;

  const clearImageSubscription = () => {
    unsubscribeImages?.();
    unsubscribeImages = undefined;
  };

  const attach = (map: MapSimple) => {
    images.value = listMapStyleImages(map);
    clearImageSubscription();
    unsubscribeImages = subscribeMapStyleImages(map, () => {
      images.value = listMapStyleImages(map);
    });
  };

  onMounted(() => {
    unsubscribeReady = subscribeMapReady(mapId, (map) => {
      attach(map);
    });
  });

  onBeforeUnmount(() => {
    unsubscribeReady?.();
    unsubscribeReady = undefined;
    clearImageSubscription();
  });

  const reload = () => {
    clearImageSubscription();
    unsubscribeReady?.();
    unsubscribeReady = subscribeMapReady(mapId, (map) => {
      attach(map);
    });
  };

  return {
    images,
    reload,
    toDataURL: styleImageToDataURL,
  };
}
