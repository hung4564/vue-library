import {
  logHelper,
  MAP_STORE_KEY,
  mapLangLogger,
  createDefaultLangStore,
  createMapLocaleApi,
  type MapLocateStore,
  MittTypeMapLang,
} from '@hungpvq/map-core';
import { loggerFactory } from '@hungpvq/shared-log';
import { createMapScopedStore } from '../../store/store';
import { useMapMittStore } from '../../store/mitt-store';

export type MapLangStore = MapLocateStore;

export const useMapLocaleStore = (mapId: string) =>
  createMapScopedStore<MapLangStore>(mapId, MAP_STORE_KEY.LANG, () => {
    logHelper(mapLangLogger, mapId, 'store')
      .with({ fn: 'useMapLocaleStore', span: 'store.init' })
      .debug('Created scoped map store for mapId.');
    return createDefaultLangStore();
  });

export const useMapLocale = (mapId: string) => {
  const store = useMapLocaleStore(mapId);
  const api = createMapLocaleApi({
    getStore: () => store,
    getEmitter: () => useMapMittStore<MittTypeMapLang>(mapId),
  });

  function asLangAction<T>(span: string, fn: () => T): T {
    return loggerFactory.ensureActionContext({ mapId, span }, fn) as T;
  }

  return {
    getMapLang: api.getMapLang,
    getLanguage: api.getLanguage,
    getFallbackLanguage: api.getFallbackLanguage,
    getLanguages: api.getLanguages,
    /** Pack bootstrap — idempotent; not an action (no ensureActionContext). */
    registerLocale: (...args: Parameters<typeof api.registerLocale>) => {
      const changed = api.registerLocale(...args);
      if (changed) {
        logHelper(mapLangLogger, mapId, 'store')
          .with({ fn: 'registerLocale', span: 'store.update' })
          .debug('registerLocale', args[0]);
      }
      return changed;
    },
    registerLocaleFlat: (
      ...args: Parameters<typeof api.registerLocaleFlat>
    ) => api.registerLocaleFlat(...args),
    registerLanguage: (...args: Parameters<typeof api.registerLanguage>) =>
      api.registerLanguage(...args),
    setLanguage: (...args: Parameters<typeof api.setLanguage>) =>
      asLangAction('lang.set', () => {
        logHelper(mapLangLogger, mapId, 'store')
          .with({ fn: 'setLanguage', span: 'store.update' })
          .debug('setLanguage', args[0]);
        return api.setLanguage(...args);
      }),
    setFallbackLanguage: (
      ...args: Parameters<typeof api.setFallbackLanguage>
    ) =>
      asLangAction('lang.set', () => api.setFallbackLanguage(...args)),
    setMapTranslate: (...args: Parameters<typeof api.setMapTranslate>) =>
      asLangAction('lang.set', () => {
        logHelper(mapLangLogger, mapId, 'store')
          .with({ fn: 'setMapTranslate', span: 'store.update' })
          .debug('setMapTranslate', args[0]);
        return api.setMapTranslate(...args);
      }),
    loadLocale: (...args: Parameters<typeof api.loadLocale>) =>
      asLangAction('lang.load', () => api.loadLocale(...args)),
  };
};
