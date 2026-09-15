import { computed, onMounted, onUnmounted, shallowRef } from 'vue';
import { translateMapLang } from '@hungpvq/map-core';
import { useMapMittStore } from '../mitt';
import { useMapLocale } from './store';
import {
  MapLangLocale,
  MapTranslateFunction,
  MittTypeMapLang,
  MittTypeMapLangEventKey,
} from '@hungpvq/map-core';

export function useLang(mapId: string) {
  if (!mapId) throw new Error('mapId is required');
  const { getMapLang, setMapLang, setMapLocaleDefault, setMapTranslate } =
    useMapLocale(mapId);
  const storeLang = shallowRef(getMapLang());
  const emitter = useMapMittStore<MittTypeMapLang>(mapId);

  onMounted(() => {
    emitter.on(MittTypeMapLangEventKey.setLocale, update);
    emitter.on(MittTypeMapLangEventKey.setTranslate, update);
    update();
  });

  onUnmounted(() => {
    emitter.off(MittTypeMapLangEventKey.setLocale, update);
    emitter.off(MittTypeMapLangEventKey.setTranslate, update);
  });

  function update() {
    storeLang.value = getMapLang();
  }

  const trans = computed(() => {
    storeLang.value;
    return (key: string, params?: MapLangLocale) =>
      translateMapLang(storeLang.value, key, params);
  });

  function setLocale(locale: MapLangLocale) {
    setMapLang(locale);
  }

  function setLocaleDefault(locale: MapLangLocale) {
    setMapLocaleDefault(locale);
  }

  function setTranslate(translate: MapTranslateFunction) {
    setMapTranslate(translate);
  }

  return { trans, setLocale, setLocaleDefault, setTranslate };
}
