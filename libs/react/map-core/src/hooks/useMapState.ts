import { useMemo } from 'react';
import { useMapGlobalStore } from '../store/store';
import type { MapStore } from '@hungpvq/map-core';

/**
 * Hook to access the global state of a map instance.
 *
 * @param mapId - The ID of the map.
 * @returns A memoized value containing the map's store state (draw, dataset, basemap, etc.).
 */
export function useMapState(mapId: string): MapStore | undefined {
  const store = useMapGlobalStore();
  return useMemo(() => store[mapId], [store, mapId]);
}
