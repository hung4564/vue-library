import type { MapSimple } from '@hungpvq/map-core';
import { subscribeMapReady } from '@hungpvq/map-core';
import {
  listMapStyleImages,
  styleImageToDataURL,
  subscribeMapStyleImages,
} from '@hungpvq/map-core/image';
import type { StyleImage } from 'maplibre-gl';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useMapImages(mapId: string) {
  const [images, setImages] = useState<Record<string, StyleImage>>({});
  const unsubscribeReadyRef = useRef<(() => void) | undefined>(undefined);
  const unsubscribeImagesRef = useRef<(() => void) | undefined>(undefined);

  const clearImageSubscription = useCallback(() => {
    unsubscribeImagesRef.current?.();
    unsubscribeImagesRef.current = undefined;
  }, []);

  const clearReadySubscription = useCallback(() => {
    unsubscribeReadyRef.current?.();
    unsubscribeReadyRef.current = undefined;
  }, []);

  const attach = useCallback(
    (map: MapSimple) => {
      setImages(listMapStyleImages(map));
      clearImageSubscription();
      unsubscribeImagesRef.current = subscribeMapStyleImages(map, () => {
        setImages(listMapStyleImages(map));
      });
    },
    [clearImageSubscription],
  );

  useEffect(() => {
    clearReadySubscription();
    clearImageSubscription();
    unsubscribeReadyRef.current = subscribeMapReady(mapId, (map) => {
      attach(map);
    });
    return () => {
      clearReadySubscription();
      clearImageSubscription();
    };
  }, [mapId, attach, clearReadySubscription, clearImageSubscription]);

  const reload = useCallback(() => {
    clearImageSubscription();
    clearReadySubscription();
    unsubscribeReadyRef.current = subscribeMapReady(mapId, (map) => {
      attach(map);
    });
  }, [mapId, attach, clearImageSubscription, clearReadySubscription]);

  return {
    images,
    toDataURL: styleImageToDataURL,
    reload,
  };
}
