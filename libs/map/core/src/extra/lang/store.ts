import { merge } from 'lodash';
import { reactive } from 'vue';
import { addStore, getStore } from '../../store';
import { addToQueue } from '../../store/queue';

const KEY = 'lang';
export type MapLocateStore = {
  locale: any;
};

function initMapLang(mapId: string) {
  addStore<MapLocateStore>(
    mapId,
    KEY,
    reactive({
      locale: {},
    })
  );
}
export function getMapLang(mapId: string) {
  const store = getStore<MapLocateStore>(mapId, KEY);
  const storeLang = store.locale;
  return storeLang;
}

export function setMapLang(mapId: string, locale: Record<string, string>) {
  const store = getMapLang(mapId);
  if (store) {
    store.locale = merge(store.locale || {}, locale);
  }
}

addToQueue(KEY, initMapLang);
