import { getMapCoreRootStore, type MapStore } from '@hungpvq/map-core';
import { computed } from 'vue';

/**
 * Hook to access the global state of a map instance.
 *
 * @param mapId - The ID of the map.
 * @returns A computed ref containing the map's store state (draw, dataset, basemap, etc.).
 */
export function useMapState(mapId: string) {
  const store = getMapCoreRootStore();
  return computed<MapStore | undefined>(() => store[mapId]);
}
