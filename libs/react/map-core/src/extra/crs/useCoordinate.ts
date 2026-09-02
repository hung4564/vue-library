/**
 * Placeholder for useCoordinate hook
 * Full implementation would be in extra/crs (not migrated yet)
 */

import { formatCoordinate, INITIAL_MAP_CRS_ITEMS, type CrsItem } from '@hungpvq/map-core';

/**
 * React-specific hook for coordinate formatting.
 * Map UI (mouse coordinates, identify) always displays WGS 84.
 */
export function useCoordinate(_mapId: string) {
  const crs: CrsItem = INITIAL_MAP_CRS_ITEMS[0];

  function format(
    { longitude, latitude }: { longitude: number; latitude: number },
    isDMS = false,
  ) {
    return formatCoordinate({ longitude, latitude }, crs, isDMS);
  }

  return { format };
}
