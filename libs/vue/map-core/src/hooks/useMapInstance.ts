import type { MapSimple } from '@hungpvq/map-core';
import {
  errorHandler,
  MapInitializationError,
  MapInitializer,
  type MapEventCallbacks,
} from '@hungpvq/map-core';
import { patchMapStyleImageAccessors } from '@hungpvq/map-core/image';
import { getUUIDv4 } from '@hungpvq/shared';
import type { Map as MaplibreMap, MapOptions } from 'maplibre-gl';
import { onMounted, onUnmounted, ref, shallowRef } from 'vue';
import { useMapContainer } from '../store/store';

export interface UseMapInstanceProps {
  mapId?: string;
  initOptions?: Partial<MapOptions>;
  mapboxAccessToken?: string;
}

export interface UseMapInstanceEmits {
  /** Fired when the map finishes loading (parity with React `onMapLoaded`). */
  (e: 'mapLoaded', map: MapSimple): void;
  /** Fired when the map is destroyed (parity with React `onMapDestroy`). */
  (e: 'mapDestroy', map: MapSimple): void;
  (e: 'error', error: Error): void;
}

/**
 * Hook to initialize and manage a MapLibre map instance.
 * MapLibre is loaded dynamically on mount (SSR / import-time safe).
 */
export function useMapInstance(
  props: UseMapInstanceProps,
  emit: UseMapInstanceEmits,
) {
  const mapContainer = ref<HTMLDivElement>();
  const isSupport = ref(true);
  const loaded = ref(false);
  const map = shallowRef<MaplibreMap | undefined>(undefined);
  const id = ref(props.mapId || getUUIDv4());
  const store = useMapContainer(id.value);

  let cancelled = false;
  let cleanupEvents: (() => void) | undefined;

  onMounted(() => {
    cancelled = false;

    void (async () => {
      try {
        const maplibre = await import('maplibre-gl');
        const mapboxgl = maplibre.default;
        if (!mapboxgl) {
          throw new Error('maplibre-gl is not installed.');
        }
        if (cancelled) return;

        patchMapStyleImageAccessors(mapboxgl.Map);

        MapInitializer.validateWebglSupport(id.value);
        isSupport.value = true;

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

        const mapInstance = new mapboxgl.Map({
          container,
          style: mapStyle,
          ...initOptions,
        });

        if (cancelled) {
          mapInstance.remove();
          return;
        }

        const mapSimpleInstance = mapInstance as MapSimple;
        mapSimpleInstance.id = id.value;

        if (cancelled) {
          mapInstance.remove();
          return;
        }

        map.value = mapInstance;
        store.initMap(mapSimpleInstance);

        const callbacks: MapEventCallbacks = {
          onLoad: (m) => {
            emit('mapLoaded', m);
            loaded.value = true;
          },
          onError: (error) => {
            errorHandler.handle(error);
            emit('error', error);
          },
          onDestroy: (m) => {
            emit('mapDestroy', m);
          },
        };

        cleanupEvents = MapInitializer.setupMapEvents(
          mapSimpleInstance,
          callbacks,
        );
      } catch (error) {
        if (cancelled) return;
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
    })();
  });

  onUnmounted(() => {
    cancelled = true;
    cleanupEvents?.();
    loaded.value = false;
    // Run store cleanups while the MapLibre instance is still usable.
    store.removeMap();
    if (map.value) {
      const mapInstance = map.value as MapSimple;
      MapInitializer.cleanupMap(mapInstance, {
        onDestroy: (m) => emit('mapDestroy', m),
      });
    }
    map.value = undefined;
  });

  return {
    mapContainer,
    isSupport,
    loaded,
    map,
    id,
  };
}
