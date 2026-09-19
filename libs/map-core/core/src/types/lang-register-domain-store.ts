import { loggerFactory } from '@hungpvq/shared-log';
import { registerMapCoreBuiltinLocales } from '../locale/register-builtin-locales';
import { ensureMapMitt } from '../mitt/index';
import {
  ensureMapDomainStore,
  registerMapDomainStoreFactory,
} from '../store/map-domain-store';
import { logHelper } from '../utils/log';
import { MAP_STORE_KEY } from './constants';
import {
  createDefaultLangStore,
  createMapLocaleApi,
  type MapLocateStore,
  type MittTypeMapLang,
} from './lang';
import { mapLangLogger } from './lang-logger';

registerMapDomainStoreFactory(MAP_STORE_KEY.LANG, {
  create: () => createDefaultLangStore(),
});

export function ensureMapLangStore(mapId: string): MapLocateStore {
  return ensureMapDomainStore<MapLocateStore>(mapId, MAP_STORE_KEY.LANG);
}

export type MapLocaleApi = ReturnType<typeof buildMapLocaleApi>;

const localeApiByStore = new WeakMap<MapLocateStore, MapLocaleApi>();

function buildMapLocaleApi(mapId: string, store: MapLocateStore) {
  const api = createMapLocaleApi({
    getStore: () => store,
    getEmitter: () => ensureMapMitt<MittTypeMapLang>(mapId),
    onRegistrationFlush: ({ langs }) => {
      logHelper(mapLangLogger, mapId, 'store')
        .with({ fn: 'locale.flush', span: 'store.update' })
        .debug('locale.flush', { langs });
    },
  });

  function asLangAction<T>(span: string, fn: () => T): T {
    return loggerFactory.ensureActionContext({ mapId, span }, fn) as T;
  }

  // One default-catalog seed per map (map-core). Dataset/draw seed via their adapters.
  registerMapCoreBuiltinLocales(mapId, api.registerLocale);

  return {
    getMapLang: api.getMapLang,
    getLanguage: api.getLanguage,
    getFallbackLanguage: api.getFallbackLanguage,
    getLanguages: api.getLanguages,
    registerLocale: api.registerLocale,
    registerLocaleFlat: api.registerLocaleFlat,
    registerLanguage: api.registerLanguage,
    setLanguage: (...args: Parameters<typeof api.setLanguage>) =>
      asLangAction('lang.set', () => {
        const prev = api.getLanguage();
        const result = api.setLanguage(...args);
        if (prev !== args[0]) {
          logHelper(mapLangLogger, mapId, 'store')
            .with({ fn: 'setLanguage', span: 'store.update' })
            .debug('setLanguage', args[0]);
        }
        return result;
      }),
    setFallbackLanguage: (
      ...args: Parameters<typeof api.setFallbackLanguage>
    ) => asLangAction('lang.set', () => api.setFallbackLanguage(...args)),
    setMapTranslate: (...args: Parameters<typeof api.setMapTranslate>) =>
      asLangAction('lang.set', () => {
        const langStore = api.getMapLang();
        const next = args[0] || undefined;
        const prev = langStore?.translate;
        const changed = !(prev === next || (!prev && !next));
        const result = api.setMapTranslate(...args);
        if (changed) {
          logHelper(mapLangLogger, mapId, 'store')
            .with({ fn: 'setMapTranslate', span: 'store.update' })
            .debug('setMapTranslate', args[0]);
        }
        return result;
      }),
    loadLocale: (...args: Parameters<typeof api.loadLocale>) =>
      asLangAction('lang.load', () => api.loadLocale(...args)),
    flushLocaleRegistrations: api.flushLocaleRegistrations,
    whenLocaleIdle: api.whenLocaleIdle,
  };
}

/**
 * Framework-agnostic locale API (store + mitt). Stable per map store instance
 * so React `useCallback(..., [api])` / `useEffect(..., [registerLocale])` stay
 * identity-stable across renders.
 */
export function ensureMapLocaleApi(mapId: string): MapLocaleApi {
  const store = ensureMapLangStore(mapId);
  const cached = localeApiByStore.get(store);
  if (cached) return cached;
  const api = buildMapLocaleApi(mapId, store);
  localeApiByStore.set(store, api);
  return api;
}
