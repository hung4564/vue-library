import { useEffect, useState } from 'react';
import type { MapSimple } from '@hungpvq/map-core';
import {
  listMapStyleImages,
  styleImageToDataURL,
  subscribeMapStyleImages,
} from '@hungpvq/map-core/image';
import type { StyleImage } from 'maplibre-gl';
import { getMap } from '../../../store/store';

export function useMapImages(mapId: string) {
  const [images, setImages] = useState<Record<string, StyleImage>>({});

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    getMap(mapId, (map) => {
      setImages(listMapStyleImages(map));
      unsubscribe = subscribeMapStyleImages(map, () => {
        setImages(listMapStyleImages(map));
      });
    });
    return () => {
      unsubscribe?.();
    };
  }, [mapId]);

  return {
    images,
    toDataURL: styleImageToDataURL,
    reload: () => getMap(mapId, (map: MapSimple) => setImages(listMapStyleImages(map))),
  };
}
