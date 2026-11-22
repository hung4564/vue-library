import type { MapCrsStore } from '@hungpvq/map-core/crs';
import { ensureMapCrsStore } from '@hungpvq/map-core/crs';

export const useMapCrsStore = (mapId: string): MapCrsStore =>
  ensureMapCrsStore(mapId);
