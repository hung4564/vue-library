import type { MapSimple } from '@hungpvq/map-core';
import { DraggableContainer } from '@hungpvq/react-draggable';
import { MapOptions } from 'maplibre-gl';
import React, { useMemo, useState } from 'react';
import { MapContextProvider } from '../context/MapContext';
import { useBreakpoints } from '../hooks/useBreakpoints';
import { useMapInstance } from '../hooks/useMapInstance';

export interface MapProps {
  mapboxAccessToken?: string;
  initOptions?: Partial<MapOptions>;
  dragId?: string;
  mapId?: string;
  onMapLoaded?: (map: MapSimple) => void;
  onMapDestroy?: (map: MapSimple) => void;
  onError?: (error: Error) => void;
  children?: React.ReactNode;
}

export function Map({
  mapboxAccessToken = '',
  initOptions = {
    attributionControl: false,
  },
  dragId,
  mapId,
  onMapLoaded,
  onMapDestroy,
  onError,
  children,
}: MapProps) {
  const breakpoints = useBreakpoints({
    mobile: 0,
    tablet: 640,
    laptop: 1024,
    desktop: 1280,
  });

  const { mapContainer, isSupport, loaded, id } = useMapInstance(
    {
      mapboxAccessToken,
      initOptions,
      mapId,
    },
    {
      onMapLoaded,
      onMapDestroy,
      onError,
    },
  );

  const draggableTo = useMemo(() => `map-draggable-${id}`, [id]);
  const rightBottomTo = useMemo(() => `bottom-right-${id}`, [id]);
  const leftBottomTo = useMemo(() => `bottom-left-${id}`, [id]);
  const rightTopTo = useMemo(() => `top-right-${id}`, [id]);
  const leftTopTo = useMemo(() => `top-left-${id}`, [id]);

  const isMobile = breakpoints.smallerOrEqual('tablet');
  const [orderCounters, setOrderCounters] = useState<Record<string, number>>(
    {},
  );

  function registerModuleOrder(key: string): number {
    setOrderCounters((prev) => {
      const newCounters = { ...prev };
      if (newCounters[key] === undefined) {
        newCounters[key] = 0;
      }
      const order = newCounters[key]++;
      return newCounters;
    });
    return orderCounters[key] ?? 0;
  }

  const contextValue = useMemo(
    () => ({
      mapId: id,
      dragId: dragId || draggableTo,
      registerModuleOrder,
    }),
    [id, dragId, draggableTo],
  );

  if (!isSupport) {
    return (
      <div>
        <div className="not-support-map">
          <p>
            Trình duyệt của bạn không hỗ trợ hiển thị bản đồ, vui lòng đổi trình
            duyệt hoặc cập nhật bản mới để xem.
          </p>
        </div>
      </div>
    );
  }

  return (
    <MapContextProvider value={contextValue}>
      <div
        className={`map-container ${isMobile ? 'map-mobile-container' : ''}`}
        data-map-id={id}
      >
        <div className="map-viewer">
          <div ref={mapContainer} className="map-content" id={id}></div>
          {/* Render container divs immediately so Portal can find them */}
          {!dragId && (
            <>
              <div className="right-bottom-container" id={rightBottomTo} />
              <div className="left-bottom-container" id={leftBottomTo} />
              <div className="right-top-container" id={rightTopTo} />
              <div className="left-top-container" id={leftTopTo} />
              {loaded && (
                <div className="drag-container">
                  <DraggableContainer containerId={draggableTo} />
                </div>
              )}
            </>
          )}
          {/* Render children after map is loaded */}
          {loaded && children}
          {/* ActionControl would go here - from extra, skip for now */}
        </div>
      </div>
    </MapContextProvider>
  );
}
