import { getUUIDv4 } from '@hungpvq/shared';
import type { MapSimple } from '@hungpvq/map-core';
import {
  MapInitializationError,
  MapInitializer,
  type MapEventCallbacks,
} from '@hungpvq/map-core';
import mapboxgl, { MapOptions } from 'maplibre-gl';
import { onMounted, onUnmounted, ref, shallowRef } from 'vue';
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

export interface UseMapInstanceEmits {
  (e: 'map-loaded', map: MapSimple): void;
  (e: 'map-destroy', map: MapSimple): void;
  (e: 'error', error: Error): void;
}

/**
 * Hook to initialize and manage a MapLibre map instance.
 *
 * @param props - Configuration properties for the map.
 * @param emit - Emit function to communicate with the parent component.
 * @returns An object containing the map instance, initialization status, and helper functions.
 */
export function useMapInstance(
  props: UseMapInstanceProps,
  emit: UseMapInstanceEmits,
) {
  const mapContainer = ref<HTMLDivElement>();
  const isSupport = ref(true);
  const loaded = ref(false);
  const map = shallowRef<mapboxgl.Map | undefined>(undefined);
  const id = ref(props.mapId || getUUIDv4());
  const store = useMapContainer(id.value);

  onMounted(() => {
    try {
      // Use MapInitializer from map-core to validate WebGL support
      MapInitializer.validateWebglSupport(id.value);
      isSupport.value = true;

      // Use MapInitializer to create default options and style
      const initOptions = MapInitializer.createDefaultOptions(
        props.initOptions,
      );
      const mapStyle = MapInitializer.createMapStyle(initOptions.style);

      const container = mapContainer.value;
      if (!container) {
        throw new MapInitializationError('Map container is not available', {
          context: { mapId: id.value },
        });
      }

      // Create map instance
      const mapInstance = new mapboxgl.Map({
        container,
        style: mapStyle,
        ...initOptions,
      });

      const mapSimpleInstance = mapInstance as MapSimple;
      mapSimpleInstance.id = id.value;
      map.value = mapInstance;

      // Initialize in store
      store.initMap(mapSimpleInstance);

      // Setup map events using MapInitializer
      const callbacks: MapEventCallbacks = {
        onLoad: (map) => {
          emit('map-loaded', map);
          loaded.value = true;
        },
        onError: (error) => {
          errorHandler.handle(error);
          emit('error', error);
        },
      };

      MapInitializer.setupMapEvents(mapSimpleInstance, callbacks);
    } catch (error) {
      isSupport.value = false;
      const mapError =
        error instanceof MapInitializationError
          ? error
          : new MapInitializationError(
              (error as Error).message || 'Failed to initialize map',
              {
                context: { mapId: id.value },
                cause: error,
              },
            );
      errorHandler.handle(mapError as Error);
      emit('error', mapError as Error);
    }
  });

  onUnmounted(() => {
    loaded.value = false;
    if (map.value) {
      const mapInstance = map.value as MapSimple;
      // Use MapInitializer to cleanup map
      MapInitializer.cleanupMap(mapInstance);
      emit('map-destroy', mapInstance);
    }
    map.value = undefined;
    store.removeMap();
  });

  return {
    mapContainer,
    isSupport,
    loaded,
    map,
    id,
  };
}
