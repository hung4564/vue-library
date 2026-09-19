import {
  ensureMapImageApi,
  ensureMapImageStore,
  type MapImageStore,
} from '@hungpvq/map-core/image';

export type { MapImageStore };

export const useMapImageStore = (mapId: string) => ensureMapImageStore(mapId);

export const useMapImage = (mapId: string) => ensureMapImageApi(mapId);
