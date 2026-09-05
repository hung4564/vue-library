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
