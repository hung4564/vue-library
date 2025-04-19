import { computed } from 'vue';
import {
  getMapLang,
  setMapLang,
  setMapLocaleDefault,
  setMapTranslate,
} from './store';

// Cache for storing resolved property values with max size limit
const MAX_CACHE_SIZE = 1000;
const propCache = new Map<string, any>();

export function useLang(mapId: string) {
  if (!mapId) throw new Error('mapId is required');

  const storeLang = computed(() => getMapLang(mapId));

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
    setMapLang(mapId, locale);
  }

  function setLocaleDefault(locale: any) {
    setMapLocaleDefault(mapId, locale);
  }

  function setTranslate(
    translate: (key: string, params?: Record<string, any>) => string
  ) {
    setMapTranslate(mapId, translate);
  }

  return { trans, setLocale, setLocaleDefault, setTranslate };
}

function getProp(
  object: any,
  path: string | string[],
  defaultVal?: string
): string | undefined {
  if (!object) return defaultVal;
  if (!path) return defaultVal;

  const pathStr = Array.isArray(path) ? path.join('.') : path;
  const cacheKey = `${JSON.stringify(object)}_${pathStr}`;

  // Check cache first
  if (propCache.has(cacheKey)) {
    return propCache.get(cacheKey);
  }

  // Clear cache if it exceeds max size
  if (propCache.size >= MAX_CACHE_SIZE) {
    propCache.clear();
  }

  const _path = Array.isArray(path)
    ? path
    : path.split('.').filter((i) => i.length);

  if (_path.length < 1) {
    const result = object === undefined ? defaultVal : object;
    if (result !== undefined && result !== defaultVal) {
      propCache.set(cacheKey, result);
    }
    return result;
  }

  const result = getProp(object[_path.shift()!], _path, defaultVal);
  if (result !== undefined && result !== defaultVal) {
    propCache.set(cacheKey, result);
  }
  return result;
}

function interpolate(text: string, params?: Record<string, any>): string {
  if (!text) return '';
  if (!params) return text;

  return text.replace(/\{(\w+)\}/g, (match, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : match;
  });
}
