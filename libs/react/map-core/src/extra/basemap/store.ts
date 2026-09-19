import { ensureMapBaseMapStore } from '@hungpvq/map-core/basemap';
import type { BaseMapStore } from '@hungpvq/map-core/basemap';

export const useMapBaseMapStore = (mapId: string): BaseMapStore =>
  ensureMapBaseMapStore(mapId);
