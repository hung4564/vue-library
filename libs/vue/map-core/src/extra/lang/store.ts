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

  function setMapLang(...args: Parameters<typeof api.setMapLang>) {
    logHelper(logger, mapId, 'store').debug('setMapLang', args[0]);
    return api.setMapLang(...args);
  }

  function setMapTranslate(...args: Parameters<typeof api.setMapTranslate>) {
    logHelper(logger, mapId, 'store').debug('setMapTranslate', args[0]);
    return api.setMapTranslate(...args);
  }

  return {
    getMapLang: api.getMapLang,
    setMapLocaleDefault: api.setMapLocaleDefault,
    setMapLang,
    setMapTranslate,
  };
};
