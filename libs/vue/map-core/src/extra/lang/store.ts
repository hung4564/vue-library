import { logHelper } from '@hungpvq/map-core';
import { merge } from 'lodash';
import { createMapScopedStore } from '../../store';
import { MAP_STORE_KEY } from '@hungpvq/map-core';
import { useMapMittStore } from '../mitt';
import { logger } from './logger';
import {
  MapLangLocale,
  MapTranslateFunction,
  MittTypeMapLang,
  MittTypeMapLangEventKey,
} from '@hungpvq/map-core';

// MapLangStore type definition
export type MapLangStore = {
  locale: MapLangLocale;
  localeDefault: MapLangLocale;
  translate?: MapTranslateFunction;
};

export const useMapLocaleStore = (mapId: string) =>
  createMapScopedStore<MapLangStore>(mapId, MAP_STORE_KEY.LANG, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return {
      locale: {},
      localeDefault: {},
    };
  });

export const useMapLocale = (mapId: string) => {
  const store = useMapLocaleStore(mapId);

  function setMapLang(locale: MapLangLocale) {
    logHelper(logger, mapId, 'store').debug('setMapLang', locale);

    if (store) {
      store.locale = merge({}, store.locale, locale);
    }
    const emitter = useMapMittStore<MittTypeMapLang>(mapId);
    emitter?.emit(MittTypeMapLangEventKey.setLocale, locale);
  }

  function setMapLocaleDefault(locale: MapLangLocale) {
    if (store) {
      store.localeDefault = merge({}, store.localeDefault, locale);
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
