import { getUUIDv4 } from '@hungpvq/shared';
import type { MapSimple } from '@hungpvq/shared-map';
import mapboxgl, { MapOptions } from 'maplibre-gl';
import { onMounted, onUnmounted, ref, shallowRef } from 'vue';
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
    if (!isSupport.value) return;

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

    map.value = mapInstance;
    (mapInstance as any).id = id.value;
    store.initMap(mapInstance as MapSimple);

    mapInstance.once('load', () => {
      emit('map-loaded', mapInstance as MapSimple);
      loaded.value = true;
    });
  });

  onUnmounted(() => {
    loaded.value = false;
    if (map.value) {
      map.value.remove();
      emit('map-destroy', map.value as MapSimple);
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
