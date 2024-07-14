import { computed } from 'vue';
import { getMapLang, setMapLang } from './store';
export function useLang(mapId: string) {
  const storeLang = computed(() => getMapLang(mapId));
  function transLocal(key: string) {
    return getProp(storeLang.value?.locale, key, key);
  }
  const trans = computed(() => {
    return transLocal;
  });
  function setLocale(locale: any) {
    setMapLang(mapId, locale);
  }
  return { trans, setLocale };
}

function getProp(object: any, path: string | string[], defaultVal?: string) {
  const _path = Array.isArray(path)
    ? path
    : path.split('.').filter((i) => i.length);

  if (_path.length < 1) {
    return object === undefined ? defaultVal : object;
  }
  if (object == null) return defaultVal;
  return getProp(object[_path.shift()!], _path, defaultVal);
}
