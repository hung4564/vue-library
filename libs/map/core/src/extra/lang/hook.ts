import { computed, onMounted, onUnmounted, shallowRef } from 'vue';
import { useMapMittStore } from '../mitt';
import { useMapLocale } from './store';
import { MittTypeMapLang, MittTypeMapLangEventKey } from './types';

const propCache = new Map<string, any>();

export function useLang(mapId: string) {
  if (!mapId) throw new Error('mapId is required');
  const { getMapLang, setMapLang, setMapLocaleDefault, setMapTranslate } =
    useMapLocale(mapId);
  const storeLang = shallowRef(getMapLang());
  const emitter = useMapMittStore<MittTypeMapLang>(mapId);
  onMounted(() => {
    emitter.on(MittTypeMapLangEventKey.setLocale, update);
    emitter.on(MittTypeMapLangEventKey.setTranslate, update);
  });
  onUnmounted(() => {
    emitter.off(MittTypeMapLangEventKey.setLocale, update);
    emitter.off(MittTypeMapLangEventKey.setTranslate, update);
  });
  function update() {
    storeLang.value = getMapLang();
  }

  function transLocal(key: string, params?: Record<string, any>) {
    // If custom translate function exists, use it
    if (storeLang.value?.translate) {
      return storeLang.value.translate(key, params);
    }

    // Otherwise use default translation logic
    // Try to get from map-specific locale first
    const fromLocale = getProp(storeLang.value?.locale, key);
    if (fromLocale !== undefined) {
      return interpolate(fromLocale, params);
    }

    // If not found, try to get from default locale
    const fromDefault = getProp(storeLang.value?.localeDefault, key);
    if (fromDefault !== undefined) {
      return interpolate(fromDefault, params);
    }

    // If still not found, return the key itself
    return key;
  }

  const trans = computed(() => {
    return transLocal;
  });

  function setLocale(locale: any) {
    setMapLang(locale);
  }

  function setLocaleDefault(locale: any) {
    setMapLocaleDefault(locale);
  }

  function setTranslate(
    translate: (key: string, params?: Record<string, any>) => string,
  ) {
    setMapTranslate(translate);
  }

  return { trans, setLocale, setLocaleDefault, setTranslate };
}

function getProp(
  object: any,
  path: string | string[],
  defaultVal?: string,
): string | undefined {
  if (!object) return defaultVal;
  if (!path) return defaultVal;

  const pathStr = Array.isArray(path) ? path.join('.') : path;

  let objCache = propCache.get(object);
  if (!objCache) {
    objCache = new Map();
    propCache.set(object, objCache);
  }

  if (objCache.has(pathStr)) {
    return objCache.get(pathStr);
  }

  const _path = Array.isArray(path) ? path : path.split('.').filter(Boolean);
  let current = object;
  for (const segment of _path) {
    if (current && typeof current === 'object' && segment in current) {
      current = current[segment];
    } else {
      return defaultVal;
    }
  }

  objCache.set(pathStr, current);
  return current;
}

function interpolate(text: string, params?: Record<string, any>): string {
  if (!text) return '';
  if (!params) return text;

  return text.replace(/\{(\w+)\}/g, (match, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : match;
  });
}
