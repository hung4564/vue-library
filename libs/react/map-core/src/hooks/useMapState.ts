import { useMemo } from 'react';
import { useStoreValue } from '@hungpvq/shared-store/react';
import {
  MAP_CORE_ROOT_STORE_KEY,
  type MapStore,
  type MapRootStore,
} from '@hungpvq/map-core';

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
