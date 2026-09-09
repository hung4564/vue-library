import { computed } from 'vue';
import { useMapGlobalStore } from '../store/store';
import type { MapStore } from '@hungpvq/map-core';

/**
 * Hook to access the global state of a map instance.
 *
 * @param mapId - The ID of the map.
 * @returns A computed ref containing the map's store state (draw, dataset, basemap, etc.).
 */
export function useMapState(mapId: string) {
  const store = useMapGlobalStore();
  return computed<MapStore | undefined>(() => store[mapId]);
}
