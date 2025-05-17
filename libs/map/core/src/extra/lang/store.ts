import { merge } from 'lodash';
import { addStore, getStore } from '../../store';
import { addToQueue } from '../../store/queue';
import { MittType } from '../../types';
import { MAP_STORE_KEY } from '../../types/key';
import {
  MapLangLocale,
  MapTranslateFunction,
  MittTypeMapLang,
  MittTypeMapLangEventKey,
} from './types';

export type MapLocateStore = {
  locale: any;
  localeDefault: any;
  translate?: (key: string, params?: MapLangLocale) => string;
};

function initMapLang(mapId: string) {
  addStore<MapLocateStore>(mapId, MAP_STORE_KEY.LANG, {
    locale: {},
    localeDefault: {},
  });
}

export function getMapLang(mapId: string) {
  const store = getStore<MapLocateStore>(mapId, MAP_STORE_KEY.LANG);
  if (!store) {
    initMapLang(mapId);
    return getStore<MapLocateStore>(mapId, MAP_STORE_KEY.LANG);
  }
  return store;
}

export function setMapLang(mapId: string, locale: MapLangLocale) {
  const store = getMapLang(mapId);
  if (store) {
    store.locale = merge({}, store.locale, locale);
  }
  const emitter = getStore<MittType<MittTypeMapLang>>(
    mapId,
    MAP_STORE_KEY.MITT,
  );
  emitter?.emit(MittTypeMapLangEventKey.setLocale, locale);
}

export function setMapLocaleDefault(mapId: string, locale: MapLangLocale) {
  const store = getMapLang(mapId);
  if (store) {
    store.localeDefault = merge({}, store.localeDefault, locale);
  }
}

export function setMapTranslate(
  mapId: string,
  translate: MapTranslateFunction,
) {
  const store = getMapLang(mapId);
  if (store) {
    store.translate = translate;
  }
  const emitter = getStore<MittType<MittTypeMapLang>>(
    mapId,
    MAP_STORE_KEY.MITT,
  );
  emitter?.emit(MittTypeMapLangEventKey.setTranslate, translate);
}

addToQueue(MAP_STORE_KEY.LANG, initMapLang);
