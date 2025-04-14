import { merge } from 'lodash';
import { reactive } from 'vue';
import { addStore, getStore } from '../../store';
import { addToQueue } from '../../store/queue';

const KEY = 'lang';
export type MapLocateStore = {
  locale: any;
  localeDefault: any;
};

function initMapLang(mapId: string) {
  addStore<MapLocateStore>(
    mapId,
    KEY,
    reactive({
      locale: {},
      localeDefault: {},
    })
  );
}

export function getMapLang(mapId: string) {
  const store = getStore<MapLocateStore>(mapId, KEY);
  if (!store) {
    initMapLang(mapId);
    return getStore<MapLocateStore>(mapId, KEY);
  }
  return store;
}

export function setMapLang(mapId: string, locale: Record<string, any>) {
  const store = getMapLang(mapId);
  if (store) {
    store.locale = merge({}, store.locale, locale);
  }
}

export function setMapLocaleDefault(
  mapId: string,
  locale: Record<string, any>
) {
  const store = getMapLang(mapId);
  if (store) {
    store.localeDefault = merge({}, store.localeDefault, locale);
  }
}

addToQueue(KEY, initMapLang);
