import {
  type MapLangFlatMessages,
  type MapLangLocale,
  type MapLanguageCode,
  type MapLanguageRegisterOptions,
  type MapLoadLocaleOptions,
  type MapLocaleLoader,
  type MittTypeMapLang,
  MittTypeMapLangEventKey,
  translateMapLang,
} from '@hungpvq/map-core';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useMapMittStore } from '../../store/mitt-store';
import { useMapLocale } from './store';

export function useLang(mapId: string) {
  if (!mapId) throw new Error('mapId is required');
  const api = useMapLocale(mapId);
  const [tick, setTick] = useState(0);
  const emitter = useMapMittStore<MittTypeMapLang>(mapId);

  useEffect(() => {
    const update = () => setTick((t) => t + 1);
    emitter.on(MittTypeMapLangEventKey.changed, update);
    return () => {
      emitter.off(MittTypeMapLangEventKey.changed, update);
    };
  }, [emitter]);

  void tick;
  const store = api.getMapLang();

  const trans = useCallback(
    (key: string, params?: MapLangLocale) => {
      void tick;
      return translateMapLang(api.getMapLang(), key, params);
    },
    [api, tick],
  );

  const registerLocale = useCallback(
    (lang: MapLanguageCode, tree: MapLangLocale) =>
      api.registerLocale(lang, tree),
    [api],
  );
  const registerLocaleFlat = useCallback(
    (lang: MapLanguageCode, flat: MapLangFlatMessages) =>
      api.registerLocaleFlat(lang, flat),
    [api],
  );
  const registerLanguage = useCallback(
    (lang: MapLanguageCode, options?: MapLanguageRegisterOptions) =>
      api.registerLanguage(lang, options),
    [api],
  );
  const setLanguage = useCallback(
    (lang: MapLanguageCode, persist = true) => api.setLanguage(lang, persist),
    [api],
  );
  const setFallbackLanguage = useCallback(
    (lang: MapLanguageCode) => api.setFallbackLanguage(lang),
    [api],
  );
  const setTranslate = useCallback(
    (translate?: Parameters<typeof api.setMapTranslate>[0]) =>
      api.setMapTranslate(translate),
    [api],
  );
  const loadLocale = useCallback(
    (
      lang: MapLanguageCode,
      loader: MapLocaleLoader,
      options?: MapLoadLocaleOptions,
    ) => api.loadLocale(lang, loader, options),
    [api],
  );
  const whenLocaleIdle = useCallback(() => api.whenLocaleIdle(), [api]);

  const languages = useMemo(() => {
    void tick;
    return api.getLanguages();
  }, [api, tick]);

  return {
    trans,
    language: store?.language ?? api.getLanguage(),
    fallbackLanguage: store?.fallbackLanguage ?? api.getFallbackLanguage(),
    languages,
    loadingLanguages: store?.loadingLanguages ?? {},
    registerLocale,
    registerLocaleFlat,
    registerLanguage,
    setLanguage,
    setFallbackLanguage,
    setTranslate,
    loadLocale,
    whenLocaleIdle,
  };
}
