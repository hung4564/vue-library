import { computed } from 'vue';
import { useMapGLobalStore } from '../store/store';
import { MapStore } from '../types';

/**
 * Hook to access the global state of a map instance.
 *
 * @param mapId - The ID of the map.
 * @returns A computed ref containing the map's store state (draw, dataset, basemap, etc.).
 */
export function useMapState(mapId: string) {
  const store = useMapGLobalStore();
  return computed<MapStore | undefined>(() => store[mapId]);
}
