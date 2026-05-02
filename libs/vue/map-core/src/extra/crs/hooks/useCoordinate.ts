import { formatCoordinate, type CrsItem } from '@hungpvq/map-core';
import { useMapCrsStore } from '../store';

/**
 * Vue-specific hook for coordinate formatting
 * Uses store to get current CRS settings
 * Proj4 transformation is now handled in map-core
 */
export function useCoordinate(mapId: string) {
  const store = useMapCrsStore(mapId);
  function format(
    { longitude, latitude }: { longitude: number; latitude: number },
    isDMS = false,
  ) {
    const crs: CrsItem =
      store.item ||
      ({
        name: 'WGS 84',
        epsg: '4326',
        default: true,
        unit: 'degree',
      } as CrsItem);

    // formatCoordinate now handles proj4 transformation internally
    return formatCoordinate({ longitude, latitude }, crs, isDMS);
  }
  return { format };
}
