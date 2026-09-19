import {
  ensureMapLocaleApi,
} from '@hungpvq/map-core';

export const useMapLocale = (mapId: string) => ensureMapLocaleApi(mapId);
