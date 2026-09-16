import {
  logHelper,
  MAP_STORE_KEY,
  createDefaultLangStore,
  createMapLocaleApi,
  type MapLocateStore,
  MittTypeMapLang,
} from '@hungpvq/map-core';
import { createMapScopedStore } from '../../store/store';
import { useMapMittStore } from '../mitt';
import { logger } from './logger';

export type MapLangStore = MapLocateStore;

export const useMapLocaleStore = (mapId: string) =>
  createMapScopedStore<MapLangStore>(mapId, MAP_STORE_KEY.LANG, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return createDefaultLangStore();
  });

export const useMapLocale = (mapId: string) => {
  const store = useMapLocaleStore(mapId);
  const api = createMapLocaleApi({
    getStore: () => store,
    getEmitter: () => useMapMittStore<MittTypeMapLang>(mapId),
  });

  return {
    getMapLang: api.getMapLang,
    getLanguage: api.getLanguage,
    getFallbackLanguage: api.getFallbackLanguage,
    getLanguages: api.getLanguages,
    registerLocale: (...args: Parameters<typeof api.registerLocale>) => {
      logHelper(logger, mapId, 'store').debug('registerLocale', args[0]);
      return api.registerLocale(...args);
    },
    registerLocaleFlat: api.registerLocaleFlat,
    registerLanguage: api.registerLanguage,
    setLanguage: (...args: Parameters<typeof api.setLanguage>) => {
      logHelper(logger, mapId, 'store').debug('setLanguage', args[0]);
      return api.setLanguage(...args);
    },
    setFallbackLanguage: api.setFallbackLanguage,
    setMapTranslate: (...args: Parameters<typeof api.setMapTranslate>) => {
      logHelper(logger, mapId, 'store').debug('setMapTranslate', args[0]);
      return api.setMapTranslate(...args);
    },
    loadLocale: api.loadLocale,
  };
};
