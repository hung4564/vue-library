import { computed } from 'vue';
import { getMapLang, setMapLang, setMapLocaleDefault } from './store';

// Cache for storing resolved property values
const propCache = new Map<string, any>();

export function useLang(mapId: string) {
  const storeLang = computed(() => getMapLang(mapId));

  function transLocal(key: string) {
    // Try to get from map-specific locale first
    const fromLocale = getProp(storeLang.value?.locale, key);
    if (fromLocale !== undefined) {
      return fromLocale;
    }

    // If not found, try to get from default locale
    const fromDefault = getProp(storeLang.value?.localeDefault, key);
    if (fromDefault !== undefined) {
      return fromDefault;
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

  return { trans, setLocale, setLocaleDefault };
}

function getProp(object: any, path: string | string[], defaultVal?: string) {
  if (!object) return defaultVal;

  const pathStr = Array.isArray(path) ? path.join('.') : path;
  const cacheKey = `${JSON.stringify(object)}_${pathStr}`;

  // Check cache first
  if (propCache.has(cacheKey)) {
    return propCache.get(cacheKey);
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
