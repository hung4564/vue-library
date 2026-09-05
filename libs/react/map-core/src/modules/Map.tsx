import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { MapSimple } from '@hungpvq/map-core';
import '@hungpvq/map-core';
import { DraggableContainer } from '@hungpvq/react-draggable';
import { MapOptions } from 'maplibre-gl';
import { MapContextProvider } from '../context/MapContext';
import { ActionControl } from '../extra/event';
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
  const orderCountersRef = useRef<Record<string, number>>({});
  const [loadedDrag, setLoadedDrag] = useState(false);

  // Sync counter like Vue — must return the incremented value immediately
  const registerModuleOrder = useCallback((key: string): number => {
    if (orderCountersRef.current[key] === undefined) {
      orderCountersRef.current[key] = 0;
    }
    return orderCountersRef.current[key]++;
  }, []);

  const contextValue = useMemo(
    () => ({
      mapId: id,
      dragId: dragId || draggableTo,
      registerModuleOrder,
    }),
    [id, dragId, draggableTo, registerModuleOrder],
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
                <DraggableContainer
                  className="drag-container"
                  containerId={draggableTo}
                  onInit={() => setLoadedDrag(true)}
                />
              )}
            </>
          )}
          {/* Render children after map is loaded */}
          {loaded && loadedDrag && children}
          {loaded && loadedDrag && <ActionControl mapId={id} />}
        </div>
      </div>
    </MapContextProvider>
  );
}
