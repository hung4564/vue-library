import { getUUIDv4 } from '@hungpvq/shared';
import { type MapSimple } from '@hungpvq/shared-map';
import mapboxgl, { MapOptions } from 'maplibre-gl';
import { onMounted, onUnmounted, ref, shallowRef } from 'vue';
import { MapEventError, MapInitializationError } from '../errors';
import { errorHandler } from '../services/error-handler.service';
import { useMapContainer } from '../store/store';

if (!mapboxgl) {
  throw new Error('mapboxgl is not installed.');
}

const DEFAULTOPTION: Partial<MapOptions> = {
  center: [105.19084739818732, 15.827971829957548],
  zoom: 5.297175623863693,
  maxZoom: 22,
};

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

function isWebglSupported() {
  if (window.WebGLRenderingContext) {
    const canvas = document.createElement('canvas');
    try {
      const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (context && typeof context.getParameter == 'function') {
        return true;
      }
    } catch (e) {
      // WebGL is supported, but disabled
    }
    return false;
  }
  return false;
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
  const isSupport = ref(isWebglSupported());
  const loaded = ref(false);
  const map = shallowRef<mapboxgl.Map | undefined>(undefined);
  const id = ref(props.mapId || getUUIDv4());
  const store = useMapContainer(id.value);

  onMounted(() => {
    try {
      if (!isSupport.value) {
        throw new MapInitializationError(
          'WebGL is not supported in this browser',
          {
            context: {
              userAgent: navigator.userAgent,
              mapId: id.value,
            },
          },
        );
      }

      const initOptions = Object.assign({}, DEFAULTOPTION, props.initOptions);
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.value!,
        style: {
          version: 8,
          metadata: {},
          sources: {},
          layers: [],
          sprite: 'https://tiles.mattech.vn/styles/basic/sprite',
          glyphs: 'https://tiles.mattech.vn/fonts/{fontstack}/{range}.pbf',
        },
        ...initOptions,
      });

      const mapSimpleInstance = mapInstance as MapSimple;
      mapSimpleInstance.id = id.value;
      map.value = mapInstance;

      store.initMap(mapSimpleInstance);

      mapInstance.once('load', () => {
        emit('map-loaded', mapSimpleInstance);
        loaded.value = true;
      });

      mapInstance.on('error', (e) => {
        const error = new MapEventError(
          `Map error: ${e.error?.message || 'Unknown error'}`,
          {
            context: { mapId: id.value },
            cause: e.error,
          },
        );
        errorHandler.handle(error);
        emit('error', error);
      });
    } catch (error) {
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
      const mapInstance = map.value;
      mapInstance.remove();
      emit('map-destroy', mapInstance as MapSimple);
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
