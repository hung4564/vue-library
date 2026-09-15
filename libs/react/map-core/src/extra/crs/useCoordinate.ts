import { createMapDisplayCoordinateFormatter } from '@hungpvq/map-core/crs';

const formatMapCoordinate = createMapDisplayCoordinateFormatter();

/**
 * React-specific hook for coordinate formatting.
 * Map UI (mouse coordinates, identify) always displays WGS 84.
 */
export function useCoordinate(_mapId: string) {
  return { format: formatMapCoordinate };
}
