import { getUUIDv4 } from '@hungpvq/shared';
import type { MapSimple } from '@hungpvq/map-core';
import {
  errorHandler,
  MapInitializationError,
  MapInitializer,
  type MapEventCallbacks,
} from '@hungpvq/map-core';
import type { Map as MaplibreMap, MapOptions } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import { useMapContainer } from '../store/store';

export interface UseMapInstanceProps {
  mapId?: string;
  initOptions?: Partial<MapOptions>;
  mapboxAccessToken?: string;
}

export interface UseMapInstanceCallbacks {
  onMapLoaded?: (map: MapSimple) => void;
  onMapDestroy?: (map: MapSimple) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to initialize and manage a MapLibre map instance.
 * MapLibre is loaded dynamically on mount (SSR / import-time safe).
 *
 * @param props - Configuration properties for the map.
 * @param callbacks - Callback functions for map events.
 * @returns An object containing the map instance, initialization status, and helper functions.
 */
export function useMapInstance(
  props: UseMapInstanceProps,
  callbacks: UseMapInstanceCallbacks = {},
) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isSupport, setIsSupport] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [map, setMap] = useState<MaplibreMap | undefined>(undefined);
  const id = useRef(props.mapId || getUUIDv4());
  const store = useMapContainer(id.current);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    let cancelled = false;
    let mapInstance: MaplibreMap | undefined;
    let cleanupEvents: (() => void) | undefined;

    void (async () => {
      try {
        const maplibre = await import('maplibre-gl');
        const mapboxgl = maplibre.default;
        if (!mapboxgl) {
          throw new Error('maplibre-gl is not installed.');
        }
        if (cancelled || !mapContainerRef.current) return;

        MapInitializer.validateWebglSupport(id.current);
        setIsSupport(true);

        const initOptions = MapInitializer.createDefaultOptions(
          props.initOptions,
        );
        const mapStyle = MapInitializer.createMapStyle(initOptions.style);

        mapInstance = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: mapStyle,
          ...initOptions,
        });

        if (cancelled) {
          mapInstance.remove();
          mapInstance = undefined;
          return;
        }

        const mapSimpleInstance = mapInstance as MapSimple;
        mapSimpleInstance.id = id.current;

        if (cancelled) {
          mapInstance.remove();
          mapInstance = undefined;
          return;
        }

        setMap(mapInstance);
        store.initMap(mapSimpleInstance);

        const eventCallbacks: MapEventCallbacks = {
          onLoad: (loadedMap) => {
            callbacksRef.current.onMapLoaded?.(loadedMap);
            setLoaded(true);
          },
          onError: (error) => {
            errorHandler.handle(error);
            callbacksRef.current.onError?.(error);
          },
          onDestroy: (destroyedMap) => {
            callbacksRef.current.onMapDestroy?.(destroyedMap);
          },
        };

        cleanupEvents = MapInitializer.setupMapEvents(
          mapSimpleInstance,
          eventCallbacks,
        );
      } catch (error) {
        if (cancelled) return;
        setIsSupport(false);
        const mapError =
          error instanceof MapInitializationError
            ? error
            : new MapInitializationError(
                (error as Error).message || 'Failed to initialize map',
                {
                  context: { mapId: id.current },
                  cause: error,
                },
              );
        errorHandler.handle(mapError as Error);
        callbacksRef.current.onError?.(mapError as Error);
      }
    })();

    return () => {
      cancelled = true;
      cleanupEvents?.();
      setLoaded(false);
      if (mapInstance) {
        const mapSimpleInstance = mapInstance as MapSimple;
        MapInitializer.cleanupMap(mapSimpleInstance, {
          onDestroy: (m) => callbacksRef.current.onMapDestroy?.(m),
        });
      }
      setMap(undefined);
      store.removeMap();
    };
  }, [props.mapId]); // eslint-disable-line react-hooks/exhaustive-deps -- intentional mapId-only mount; remounting on callbacks/options would recreate the map

  return {
    mapContainer: mapContainerRef,
    isSupport,
    loaded,
    map,
    id: id.current,
  };
}
