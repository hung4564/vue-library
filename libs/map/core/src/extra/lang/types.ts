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
