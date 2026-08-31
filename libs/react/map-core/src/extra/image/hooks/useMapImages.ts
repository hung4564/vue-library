import { useEffect, useState } from 'react';
import type { MapSimple } from '@hungpvq/map-core';
import { styleImageToDataURL } from '@hungpvq/map-core';
import type { StyleImage } from 'maplibre-gl';
import { getMap } from '../../../store/store';

export function useMapImages(mapId: string) {
  const [images, setImages] = useState<Record<string, StyleImage>>({});

  const loadImages = (map: MapSimple) => {
    if (!map) return;
    const names = map.listImages();
    const result: Record<string, StyleImage> = {};
    names.forEach((name) => {
      const img = map.getImage(name);
      if (img) result[name] = img;
    });
    setImages(result);
  };

  useEffect(() => {
    let handle: (() => void) | undefined;
    getMap(mapId, (map) => {
      loadImages(map);
      handle = () => loadImages(map);
      map.on('styledata', handle);
      map.on('idle', handle);
    });
    return () => {
      getMap(mapId, (map) => {
        if (handle) {
          map.off('styledata', handle);
          map.off('idle', handle);
        }
      });
    };
  }, [mapId]);

  return { images, toDataURL: styleImageToDataURL, reload: () => getMap(mapId, loadImages) };
}
