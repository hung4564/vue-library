import { logHelper, MAP_STORE_KEY, deepMergeLocale, createDefaultLangStore } from '@hungpvq/map-core';
import { createMapScopedStore } from '../../store';
import { useMapMittStore } from '../mitt';
import { logger } from './logger';
import {
  MapLangLocale,
  MapTranslateFunction,
  MittTypeMapLang,
  MittTypeMapLangEventKey,
  type MapLocateStore,
} from '@hungpvq/map-core';

export type MapLangStore = MapLocateStore;

export const useMapLocaleStore = (mapId: string) =>
  createMapScopedStore<MapLangStore>(mapId, MAP_STORE_KEY.LANG, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return createDefaultLangStore();
  });

export const useMapLocale = (mapId: string) => {
  const store = useMapLocaleStore(mapId);

  function setMapLang(locale: MapLangLocale) {
    logHelper(logger, mapId, 'store').debug('setMapLang', locale);

    if (store) {
      store.locale = deepMergeLocale(store.locale, locale);
    }
    const emitter = useMapMittStore<MittTypeMapLang>(mapId);
    emitter?.emit(MittTypeMapLangEventKey.setLocale, locale);
  }

  function setMapLocaleDefault(locale: MapLangLocale) {
    if (store) {
      store.localeDefault = deepMergeLocale(store.localeDefault, locale);
    }
  }

  function setMapTranslate(translate: MapTranslateFunction) {
    logHelper(logger, mapId, 'store').debug('setMapTranslate', translate);

    if (store) {
      store.translate = translate;
    }
    const emitter = useMapMittStore<MittTypeMapLang>(mapId);
    emitter?.emit(MittTypeMapLangEventKey.setTranslate, translate);
  }

  function getMapLang() {
    return store;
  }

  return { getMapLang, setMapTranslate, setMapLocaleDefault, setMapLang };
};
