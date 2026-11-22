import {
  MAP_CORE_ROOT_STORE_KEY,
  type MapRootStore,
  type MapStore,
} from '@hungpvq/map-core';
import { useStoreValue } from '@hungpvq/shared-store/react';
import { useMemo } from 'react';

/**
 * Hook to access the global state of a map instance.
 *
 * @param mapId - The ID of the map.
 * @returns A memoized value containing the map's store state (draw, dataset, basemap, etc.).
 */
export function useMapState(mapId: string): MapStore | undefined {
  const [store] = useStoreValue<MapRootStore>(MAP_CORE_ROOT_STORE_KEY, {});
  return useMemo(() => store?.[mapId], [store, mapId]);
}
