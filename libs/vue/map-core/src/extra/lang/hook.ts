import { computed, onMounted, onUnmounted, shallowRef, triggerRef } from 'vue';
import {
  translateMapLang,
  type MapLangLocale,
  type MapTranslateFunction,
  type MapLanguageCode,
  type MapLocaleLoader,
  type MapLoadLocaleOptions,
  type MapLanguageRegisterOptions,
  type MapLangFlatMessages,
  MittTypeMapLang,
  MittTypeMapLangEventKey,
} from '@hungpvq/map-core';
import { useMapMittStore } from '../../store/mitt-store';
import { useMapLocale } from './store';

export function useLang(mapId: string) {
  if (!mapId) throw new Error('mapId is required');
  const api = useMapLocale(mapId);
  const storeLang = shallowRef(api.getMapLang());
  const emitter = useMapMittStore<MittTypeMapLang>(mapId);

  onMounted(() => {
    emitter.on(MittTypeMapLangEventKey.changed, update);
    update();
  });

  onUnmounted(() => {
    emitter.off(MittTypeMapLangEventKey.changed, update);
  });

  function update() {
    // Store is mutated in place — force shallowRef subscribers to re-run.
    storeLang.value = api.getMapLang();
    triggerRef(storeLang);
  }

  const trans = computed(() => {
    storeLang.value;
    return (key: string, params?: MapLangLocale) =>
      translateMapLang(storeLang.value, key, params);
  });

  const language = computed(
    () => storeLang.value?.language ?? api.getLanguage(),
  );
  const fallbackLanguage = computed(
    () => storeLang.value?.fallbackLanguage ?? api.getFallbackLanguage(),
  );
  const languages = computed(() => api.getLanguages());
  const loadingLanguages = computed(
    () => storeLang.value?.loadingLanguages ?? {},
  );

  function registerLocale(lang: MapLanguageCode, tree: MapLangLocale) {
    api.registerLocale(lang, tree);
  }

  function registerLocaleFlat(
    lang: MapLanguageCode,
    flat: MapLangFlatMessages,
  ) {
    api.registerLocaleFlat(lang, flat);
  }

  function registerLanguage(
    lang: MapLanguageCode,
    options?: MapLanguageRegisterOptions,
  ) {
    api.registerLanguage(lang, options);
  }

  function setLanguage(lang: MapLanguageCode, persist = true) {
    api.setLanguage(lang, persist);
  }

  function setFallbackLanguage(lang: MapLanguageCode) {
    api.setFallbackLanguage(lang);
  }

  function setTranslate(translate?: MapTranslateFunction | null) {
    api.setMapTranslate(translate);
  }

  function loadLocale(
    lang: MapLanguageCode,
    loader: MapLocaleLoader,
    options?: MapLoadLocaleOptions,
  ) {
    return api.loadLocale(lang, loader, options);
  }

  function whenLocaleIdle() {
    return api.whenLocaleIdle();
  }

  return {
    trans,
    language,
    fallbackLanguage,
    languages,
    loadingLanguages,
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
