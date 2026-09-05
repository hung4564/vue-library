import { useEffect, useRef, useState } from 'react';
import {
  type MapCompareSetting,
  type MittTypeMapCompare,
  MittTypeMapCompareEventKey,
} from '@hungpvq/map-core';
import { getUUIDv4 } from '@hungpvq/shared';
import { Map } from '../../../modules/Map';
import { useMapMittStore } from '../../mitt';
import { ActionControl } from '../../event';
import { initStoreMapCompare, getMapCompareSetting } from '../store';
import type { MapOptions } from 'maplibre-gl';

export interface MapCompareProps {
  mapboxAccessToken?: string;
  initOptions?: Partial<MapOptions>;
  dragId?: string;
  children?: React.ReactNode;
}

export function MapCompare({
  mapboxAccessToken = '',
  initOptions = { attributionControl: false },
  dragId,
  children,
}: MapCompareProps) {
  const [id] = useState(() => getUUIDv4());
  const containerRef = useRef<HTMLDivElement>(null);
  const [setting, setSetting] = useState<MapCompareSetting>(
    () =>
      getMapCompareSetting(id) || {
        compare: true,
        split: true,
        sync: true,
        vertical: false,
      },
  );
  const emitter = useMapMittStore<MittTypeMapCompare>(id);
  const swiper = useRef<{ clear: () => void; resize: () => void }>();

  useEffect(() => {
    initStoreMapCompare(id);
    const update = (s: MapCompareSetting) => setSetting({ ...s });
    emitter.on(MittTypeMapCompareEventKey.set, update);
    const swiperInstance = swiper.current;
    return () => {
      emitter.off(MittTypeMapCompareEventKey.set, update);
      swiperInstance?.clear?.();
    };
  }, [id, emitter]);

  return (
    <div
      ref={containerRef}
      className={`map-compare-container${setting.vertical ? ' is-vertical' : ''}`}
    >
      <div className="map-compare__container">
        <div className="map-compare__item">
          <Map
            mapId={`${id}-a`}
            mapboxAccessToken={mapboxAccessToken}
            initOptions={initOptions}
            dragId={dragId}
          >
            <ActionControl mapId={`${id}-a`} />
            {children}
          </Map>
        </div>
        {setting.split ? (
          <div className="map-compare__item">
            <Map
              mapId={`${id}-b`}
              mapboxAccessToken={mapboxAccessToken}
              initOptions={initOptions}
              dragId={dragId}
            >
              <ActionControl mapId={`${id}-b`} />
            </Map>
          </div>
        ) : null}
      </div>
    </div>
  );
}
