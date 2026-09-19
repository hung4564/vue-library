import {
  logHelper,
  MAP_STORE_KEY,
  createDefaultLangStore,
  createMapLocaleApi,
  type MapLocateStore,
  MittTypeMapLang,
} from '@hungpvq/map-core';
import { useMemo } from 'react';
import { createMapScopedStore } from '../../store/store';
import { getMapMittStore } from '../../store/mitt-store';
import { loggerFactory } from '@hungpvq/shared-log';

const logger = loggerFactory.createLogger().setNamespace('map:lang', 2);

export type MapLangStore = MapLocateStore;

export const useMapLocaleStore = (mapId: string) =>
  createMapScopedStore<MapLangStore>(mapId, MAP_STORE_KEY.LANG, () => {
    logHelper(logger, mapId, 'store')
      .with({ fn: 'useMapLocaleStore', span: 'store.init' })
      .debug('init');
    return createDefaultLangStore();
  });

export const useMapLocale = (mapId: string) => {
  const store = useMapLocaleStore(mapId);
  return useMemo(() => {
    const api = createMapLocaleApi({
      getStore: () => store,
      getEmitter: () => getMapMittStore<MittTypeMapLang>(mapId),
    });

    return {
      getMapLang: api.getMapLang,
      getLanguage: api.getLanguage,
      getFallbackLanguage: api.getFallbackLanguage,
      getLanguages: api.getLanguages,
      registerLocale: (...args: Parameters<typeof api.registerLocale>) => {
        logHelper(logger, mapId, 'store')
          .with({ fn: 'registerLocale', span: 'store.update' })
          .debug('registerLocale', args[0]);
        return api.registerLocale(...args);
      },
      registerLocaleFlat: (
        ...args: Parameters<typeof api.registerLocaleFlat>
      ) => api.registerLocaleFlat(...args),
      registerLanguage: (...args: Parameters<typeof api.registerLanguage>) =>
        api.registerLanguage(...args),
      setLanguage: (...args: Parameters<typeof api.setLanguage>) => {
        logHelper(logger, mapId, 'store')
          .with({ fn: 'setLanguage', span: 'store.update' })
          .debug('setLanguage', args[0]);
        return api.setLanguage(...args);
      },
      setFallbackLanguage: (
        ...args: Parameters<typeof api.setFallbackLanguage>
      ) => api.setFallbackLanguage(...args),
      setMapTranslate: (...args: Parameters<typeof api.setMapTranslate>) => {
        logHelper(logger, mapId, 'store')
          .with({ fn: 'setMapTranslate', span: 'store.update' })
          .debug('setMapTranslate', args[0]);
        return api.setMapTranslate(...args);
      },
      loadLocale: (...args: Parameters<typeof api.loadLocale>) =>
        api.loadLocale(...args),
    };
  }, [mapId, store]);
};
