import { getUUIDv4 } from '@hungpvq/shared';
import type { MapSimple } from '@hungpvq/map-core';
import {
  MapInitializationError,
  MapInitializer,
  type MapEventCallbacks,
} from '@hungpvq/map-core';
import mapboxgl, { MapOptions } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import { errorHandler } from '../services/error-handler.service';
import { useMapContainer } from '../store/store';

if (!mapboxgl) {
  throw new Error('mapboxgl is not installed.');
}

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
  const [map, setMap] = useState<mapboxgl.Map | undefined>(undefined);
  const id = useRef(props.mapId || getUUIDv4());
  const store = useMapContainer(id.current);

  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    let mapInstance: mapboxgl.Map | undefined;

    try {
      // Use MapInitializer from map-core to validate WebGL support
      MapInitializer.validateWebglSupport(id.current);
      setIsSupport(true);

      // Use MapInitializer to create default options and style
      const initOptions = MapInitializer.createDefaultOptions(
        props.initOptions,
      );
      const mapStyle = MapInitializer.createMapStyle(initOptions.style);

      // Create map instance
      mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: mapStyle,
        ...initOptions,
      });

      const mapSimpleInstance = mapInstance as MapSimple;
      mapSimpleInstance.id = id.current;
      setMap(mapInstance);

      // Initialize in store
      store.initMap(mapSimpleInstance);

      // Setup map events using MapInitializer
      const eventCallbacks: MapEventCallbacks = {
        onLoad: (map) => {
          callbacks.onMapLoaded?.(map);
          setLoaded(true);
        },
        onError: (error) => {
          errorHandler.handle(error);
          callbacks.onError?.(error);
        },
      };

      MapInitializer.setupMapEvents(mapSimpleInstance, eventCallbacks);
    } catch (error) {
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
      callbacks.onError?.(mapError as Error);
    }

    return () => {
      setLoaded(false);
      if (mapInstance) {
        const mapSimpleInstance = mapInstance as MapSimple;
        // Use MapInitializer to cleanup map
        MapInitializer.cleanupMap(mapSimpleInstance);
        callbacks.onMapDestroy?.(mapSimpleInstance);
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
