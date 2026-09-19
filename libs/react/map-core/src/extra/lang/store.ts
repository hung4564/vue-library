import {
  ensureMapLocaleApi,
  type MapLocateStore,
} from '@hungpvq/map-core';

export type MapLangStore = MapLocateStore;

export const useMapLocale = (mapId: string) => ensureMapLocaleApi(mapId);
