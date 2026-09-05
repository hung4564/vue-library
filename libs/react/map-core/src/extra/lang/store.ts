import {
  logHelper,
  MAP_STORE_KEY,
  deepMergeLocale,
  createDefaultLangStore,
  type MapLangLocale,
  type MapTranslateFunction,
  type MapLocateStore,
  MittTypeMapLang,
  MittTypeMapLangEventKey,
} from '@hungpvq/map-core';
import { useCallback } from 'react';
import { createMapScopedStore } from '../../store';
import { useMapMittStore } from '../mitt';
import { loggerFactory } from '@hungpvq/shared-log';

const logger = loggerFactory.createLogger().setNamespace('map:lang', 2);

export type MapLangStore = MapLocateStore;

export const useMapLocaleStore = (mapId: string) =>
  createMapScopedStore<MapLangStore>(mapId, MAP_STORE_KEY.LANG, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return createDefaultLangStore();
  });

export const useMapLocale = (mapId: string) => {
  const store = useMapLocaleStore(mapId);
  const emitter = useMapMittStore<MittTypeMapLang>(mapId);

  const setMapLang = useCallback((locale: MapLangLocale) => {
    if (store) {
      store.locale = deepMergeLocale(store.locale, locale);
    }
    emitter?.emit(MittTypeMapLangEventKey.setLocale, locale);
  }, [store, emitter]);

  const setMapLocaleDefault = useCallback((locale: MapLangLocale) => {
    if (store) {
      store.localeDefault = deepMergeLocale(store.localeDefault, locale);
    }
  }, [store]);

  const setMapTranslate = useCallback((translate: MapTranslateFunction) => {
    if (store) {
      store.translate = translate;
    }
    emitter?.emit(MittTypeMapLangEventKey.setTranslate, translate);
  }, [store, emitter]);

  const getMapLang = useCallback(() => store, [store]);

  return { getMapLang, setMapTranslate, setMapLocaleDefault, setMapLang };
};
