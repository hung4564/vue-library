import { useMemo } from 'react';
import { useStoreValue } from '@hungpvq/shared-store/react';
import type { MapStore } from '@hungpvq/map-core';
import { MAP_CORE_STORE_ID } from '../store/global-store';

type MapRootStore = Record<string, MapStore>;

/**
 * Hook to access the global state of a map instance.
 *
 * @param mapId - The ID of the map.
 * @returns A memoized value containing the map's store state (draw, dataset, basemap, etc.).
 */
export function useMapState(mapId: string): MapStore | undefined {
  const [store] = useStoreValue<MapRootStore>(MAP_CORE_STORE_ID, {});
  return useMemo(() => store?.[mapId], [store, mapId]);
}
