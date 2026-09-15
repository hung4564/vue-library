/**
 * Framework-agnostic types for internationalization
 */
export const MittTypeMapLangEventKey = {
  setLocale: 'map:lang:set-locale',
  setTranslate: 'map:lang:set-translate',
} as const;

export type MittTypeMapLang = {
  [MittTypeMapLangEventKey.setLocale]: MapLangLocale;
  [MittTypeMapLangEventKey.setTranslate]: MapTranslateFunction;
};

export type MapLangLocale = Record<string, unknown>;

export type MapLocateStore = {
  locale: MapLangLocale;
  localeDefault: MapLangLocale;
  translate?: MapTranslateFunction;
};

export type MapTranslateFunction = (
  key: string,
  params?: MapLangLocale,
) => string;

export function createDefaultLangStore(): MapLocateStore {
  return {
    locale: {},
    localeDefault: {},
  };
}

const propCache = new Map<object, Map<string, string | undefined>>();

/** Resolve a dotted path on a locale object (cached per object). */
export function getLocaleProp(
  object: object | undefined,
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

  const segments = Array.isArray(path) ? path : path.split('.').filter(Boolean);
  let current: unknown = object;
  for (const segment of segments) {
    if (
      current &&
      typeof current === 'object' &&
      segment in (current as Record<string, unknown>)
    ) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return defaultVal;
    }
  }

  const result = typeof current === 'string' ? current : defaultVal;
  if (result !== undefined) {
    objCache.set(pathStr, result);
  }
  return result;
}

/** Replace `{name}` placeholders in a locale string. */
export function interpolateLocale(
  text: string,
  params?: MapLangLocale,
): string {
  if (!text) return '';
  if (!params) return text;

  return text.replace(/\{(\w+)\}/g, (match, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : match;
  });
}

/** Framework-agnostic translation lookup for map locale stores. */
export function translateMapLang(
  storeLang: MapLocateStore | undefined,
  key: string,
  params?: MapLangLocale,
): string {
  if (storeLang?.translate) {
    return storeLang.translate(key, params);
  }

  const fromLocale = getLocaleProp(storeLang?.locale, key);
  if (fromLocale !== undefined) {
    return interpolateLocale(fromLocale, params);
  }

  const fromDefault = getLocaleProp(storeLang?.localeDefault, key);
  if (fromDefault !== undefined) {
    return interpolateLocale(fromDefault, params);
  }

  return key;
}

export type MapLocaleEmitter = {
  emit(
    event: (typeof MittTypeMapLangEventKey)[keyof typeof MittTypeMapLangEventKey],
    payload?: MapLangLocale | MapTranslateFunction,
  ): void;
};

export type MapLocaleApiOptions = {
  getStore: () => MapLocateStore | undefined;
  getEmitter?: () => MapLocaleEmitter | undefined;
};

/** Framework-agnostic locale store mutations (Vue/React adapters wrap with scoped store + mitt). */
export function createMapLocaleApi(options: MapLocaleApiOptions) {
  const { getStore, getEmitter } = options;

  function setMapLang(locale: MapLangLocale) {
    const store = getStore();
    if (store) {
      store.locale = deepMergeLocale(store.locale, locale);
    }
    getEmitter?.()?.emit(MittTypeMapLangEventKey.setLocale, locale);
  }

  function setMapLocaleDefault(locale: MapLangLocale) {
    const store = getStore();
    if (store) {
      store.localeDefault = deepMergeLocale(store.localeDefault, locale);
    }
  }

  function setMapTranslate(translate: MapTranslateFunction) {
    const store = getStore();
    if (store) {
      store.translate = translate;
    }
    getEmitter?.()?.emit(MittTypeMapLangEventKey.setTranslate, translate);
  }

  function getMapLang() {
    return getStore();
  }

  return { getMapLang, setMapTranslate, setMapLocaleDefault, setMapLang };
}

export function deepMergeLocale(
  target: MapLangLocale,
  source: MapLangLocale,
): MapLangLocale {
  const out: MapLangLocale = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = out[key];
    if (
      sv &&
      typeof sv === 'object' &&
      !Array.isArray(sv) &&
      tv &&
      typeof tv === 'object' &&
      !Array.isArray(tv)
    ) {
      out[key] = deepMergeLocale(tv as MapLangLocale, sv as MapLangLocale);
    } else {
      out[key] = sv;
    }
  }
  return out;
}
