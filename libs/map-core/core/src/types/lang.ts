/**
 * Framework-agnostic map i18n: per-language message catalogs,
 * configurable active/fallback language, flat key-value + async loaders.
 */

export const MAP_BUILTIN_LANGUAGES = ['en', 'vi'] as const;

export const MAP_LANGUAGE_STORAGE_KEY = 'hungpvq.map-language';

/** BCP-47-ish language code (not limited to built-ins). */
export type MapLanguageCode = string;

/**
 * Language code used for built-in control/package message catalogs.
 * Other languages are app-owned (`locales` / `loadLocale` / `registerLocale`).
 */
export const MAP_DEFAULT_CATALOG_LANGUAGE: MapLanguageCode = 'en';

export type MapLangLocale = Record<string, unknown>;

/** Flat dotted keys from API / CMS, e.g. `{ "map.home.title": "…" }`. */
export type MapLangFlatMessages = Record<string, string>;

export type MapLocaleLoader = (
  lang: MapLanguageCode,
) => Promise<MapLangLocale | MapLangFlatMessages | null | undefined>;

export type MapTranslateFallback = () => string;

/**
 * Custom translator — plug in vue-i18n / i18next / etc.
 * Optional `fallback` resolves the built-in message catalogs when your
 * library has no entry for `key`.
 */
export type MapTranslateFunction = (
  key: string,
  params?: MapLangLocale,
  fallback?: MapTranslateFallback,
) => string;

export type MapLanguageRegisterOptions = {
  label?: string;
};

export type MapLoadLocaleOptions = {
  /**
   * Re-fetch and merge even if this language was already loaded via `loadLocale`.
   * Built-in `registerLocale` packs do not block the loader — overlays always
   * merge on first load (e.g. demo-i18n on top of MAP_*_LOCALE_*).
   */
  force?: boolean;
};

export type MapBootstrapLanguageOptions = {
  /** Persist to localStorage (default true). */
  persist?: boolean;
  fallbackLanguage?: MapLanguageCode;
};

export const MittTypeMapLangEventKey = {
  changed: 'map:lang:changed',
} as const;

export type MittTypeMapLang = {
  [MittTypeMapLangEventKey.changed]: undefined;
};

export type MapLocateStore = {
  language: MapLanguageCode;
  fallbackLanguage: MapLanguageCode;
  messages: Record<string, MapLangLocale>;
  languageLabels: Record<string, string>;
  loadingLanguages: Record<string, boolean>;
  translate?: MapTranslateFunction;
};

export type CreateDefaultLangStoreOptions = {
  language?: MapLanguageCode;
  fallbackLanguage?: MapLanguageCode;
};

export function createDefaultLangStore(
  options: CreateDefaultLangStoreOptions = {},
): MapLocateStore {
  return {
    language: options.language ?? 'en',
    fallbackLanguage: options.fallbackLanguage ?? 'en',
    messages: {},
    languageLabels: {},
    loadingLanguages: {},
  };
}

export function getStoredMapLanguage(
  fallback: MapLanguageCode = 'en',
): MapLanguageCode {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(MAP_LANGUAGE_STORAGE_KEY);
    if (raw && raw.trim()) return raw.trim();
  } catch {
    /* ignore */
  }
  return fallback;
}

/** Uppercase chip label for LanguageControl (EN / VI / FR). */
export function mapLanguageCodeLabel(code: MapLanguageCode): string {
  return String(code).toUpperCase();
}

/**
 * Resolve LanguageControl initial code: stored preference if in `languages`,
 * else `defaultLanguage` (default `vi`).
 */
export function resolveInitialMapLanguage(
  languages: MapLanguageCode[],
  defaultLanguage: MapLanguageCode = 'vi',
): MapLanguageCode {
  const fallback = defaultLanguage || 'vi';
  const list = languages.map(String);
  const stored = getStoredMapLanguage(fallback);
  return list.includes(stored) ? stored : fallback;
}

/** Cycle to the next code in `languages` after `current` (wraps). */
export function nextMapLanguageInList(
  languages: MapLanguageCode[],
  current: MapLanguageCode,
): MapLanguageCode | undefined {
  const list = languages.map(String);
  if (!list.length) return undefined;
  const idx = list.indexOf(String(current));
  return list[(idx + 1) % list.length];
}

export type RegisterLanguageControlPacksOptions = {
  registerLocale: (code: MapLanguageCode, tree: MapLangLocale) => void;
  registerLanguage: (
    code: MapLanguageCode,
    options?: MapLanguageRegisterOptions,
  ) => void;
  locales?: Record<string, MapLangLocale>;
  labels?: Record<string, string>;
  languages: MapLanguageCode[];
  /** Resolve chip/tooltip label when `labels[code]` is absent. */
  resolveLabel?: (code: MapLanguageCode) => string;
};

/**
 * Register LanguageControl metadata + optional app `locales` overlays.
 * Locale trees are registered only for codes listed in `languages`
 * (pass pack via `locales[code]` when enabling that language).
 * Built-in default catalog (EN) is owned by each package once per map.
 */
export function registerLanguageControlPacks(
  options: RegisterLanguageControlPacksOptions,
): void {
  const {
    registerLocale,
    registerLanguage,
    locales,
    labels,
    languages,
    resolveLabel,
  } = options;

  for (const code of languages.map(String)) {
    const tree = locales?.[code];
    if (tree) registerLocale(code, tree);
    registerLanguage(code, {
      label:
        labels?.[code] ??
        resolveLabel?.(code) ??
        mapLanguageCodeLabel(code),
    });
  }
}

export function setStoredMapLanguage(lang: MapLanguageCode): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(MAP_LANGUAGE_STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
}

/** Set initial language (+ optional persist / fallback). Does not touch message catalogs. */
export function bootstrapMapLanguage(
  lang: MapLanguageCode,
  options: MapBootstrapLanguageOptions = {},
): MapLanguageCode {
  const persist = options.persist !== false;
  if (persist) setStoredMapLanguage(lang);
  return lang;
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

/** Convert flat dotted keys into a nested locale tree. */
export function unflattenLocaleMessages(
  flat: MapLangFlatMessages,
): MapLangLocale {
  const out: MapLangLocale = {};
  for (const [path, value] of Object.entries(flat)) {
    if (typeof value !== 'string') continue;
    const segments = path.split('.').filter(Boolean);
    if (!segments.length) continue;
    let cursor: MapLangLocale = out;
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i]!;
      const next = cursor[seg];
      if (!next || typeof next !== 'object' || Array.isArray(next)) {
        cursor[seg] = {};
      }
      cursor = cursor[seg] as MapLangLocale;
    }
    cursor[segments[segments.length - 1]!] = value;
  }
  return out;
}

/** Flatten a nested locale tree into dotted key-value pairs. */
export function flattenLocaleMessages(
  tree: MapLangLocale,
  prefix = '',
): MapLangFlatMessages {
  const out: MapLangFlatMessages = {};
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flattenLocaleMessages(value as MapLangLocale, path));
    } else if (typeof value === 'string') {
      out[path] = value;
    }
  }
  return out;
}

/** Flatten-compare nested locale trees (string leaves only). */
export function localeTreesEqual(
  a: MapLangLocale,
  b: MapLangLocale,
): boolean {
  const fa = flattenLocaleMessages(a);
  const fb = flattenLocaleMessages(b);
  const keysA = Object.keys(fa);
  const keysB = Object.keys(fb);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (fa[key] !== fb[key]) return false;
  }
  return true;
}

/** Keys present in `a` but missing in `b` (and vice versa when comparing both ways). */
export function diffLocaleKeys(
  a: MapLangLocale,
  b: MapLangLocale,
): { missingInB: string[]; missingInA: string[] } {
  const keysA = new Set(Object.keys(flattenLocaleMessages(a)));
  const keysB = new Set(Object.keys(flattenLocaleMessages(b)));
  const missingInB: string[] = [];
  const missingInA: string[] = [];
  for (const key of keysA) {
    if (!keysB.has(key)) missingInB.push(key);
  }
  for (const key of keysB) {
    if (!keysA.has(key)) missingInA.push(key);
  }
  missingInB.sort();
  missingInA.sort();
  return { missingInB, missingInA };
}

/** True when payload looks like flat dotted string map (not nested locale). */
export function isMapLangFlatMessages(
  value: MapLangLocale | MapLangFlatMessages,
): value is MapLangFlatMessages {
  const keys = Object.keys(value);
  if (!keys.length) return false;
  return keys.every(
    (k) =>
      k.includes('.') && typeof (value as MapLangFlatMessages)[k] === 'string',
  );
}

/** Catalog-only lookup (no custom `translate`). Used as fallback for external i18n. */
export function translateMapLangFromCatalog(
  storeLang: MapLocateStore | undefined,
  key: string,
  params?: MapLangLocale,
): string {
  const active = storeLang?.language ?? 'en';
  const fallback = storeLang?.fallbackLanguage ?? 'en';
  const messages = storeLang?.messages;

  const fromActive = getLocaleProp(messages?.[active], key);
  if (fromActive !== undefined) {
    return interpolateLocale(fromActive, params);
  }

  if (fallback !== active) {
    const fromFallback = getLocaleProp(messages?.[fallback], key);
    if (fromFallback !== undefined) {
      return interpolateLocale(fromFallback, params);
    }
  }

  return key;
}

/** Framework-agnostic translation lookup for map locale stores. */
export function translateMapLang(
  storeLang: MapLocateStore | undefined,
  key: string,
  params?: MapLangLocale,
): string {
  if (storeLang?.translate) {
    return storeLang.translate(key, params, () =>
      translateMapLangFromCatalog(storeLang, key, params),
    );
  }

  return translateMapLangFromCatalog(storeLang, key, params);
}

export type MapLocaleEmitter = {
  emit(
    event: (typeof MittTypeMapLangEventKey)[keyof typeof MittTypeMapLangEventKey],
    payload?: undefined,
  ): void;
};

export type MapLocaleApiOptions = {
  getStore: () => MapLocateStore | undefined;
  getEmitter?: () => MapLocaleEmitter | undefined;
  /** Called once per debounced registration flush (after emit). */
  onRegistrationFlush?: (info: {
    langs: MapLanguageCode[];
    merged: boolean;
  }) => void;
};

function emitChanged(getEmitter?: () => MapLocaleEmitter | undefined) {
  getEmitter?.()?.emit(MittTypeMapLangEventKey.changed);
}

/** Debounce window so mount-time registerLocale waves flush as one emit. */
export const MAP_LOCALE_REGISTER_DEBOUNCE_MS = 32;

/** Framework-agnostic locale store mutations (Vue/React adapters wrap with scoped store + mitt). */
export function createMapLocaleApi(options: MapLocaleApiOptions) {
  const { getStore, getEmitter, onRegistrationFlush } = options;

  let pendingEmit = false;
  let flushTimer: ReturnType<typeof setTimeout> | null = null;
  let flushResolvers: Array<() => void> = [];
  const pendingLangs = new Set<MapLanguageCode>();
  /** Languages successfully fetched via `loadLocale` (not built-in registerLocale). */
  const loadedViaLoader = new Set<MapLanguageCode>();

  function flushLocaleRegistrations(): void {
    if (flushTimer != null) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    const langs = [...pendingLangs];
    pendingLangs.clear();
    const shouldEmit = pendingEmit;
    pendingEmit = false;
    if (shouldEmit) {
      emitChanged(getEmitter);
      onRegistrationFlush?.({ langs, merged: true });
    }
    const resolvers = flushResolvers;
    flushResolvers = [];
    for (const resolve of resolvers) resolve();
  }

  function scheduleFlush(): void {
    if (flushTimer != null) return;
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flushLocaleRegistrations();
    }, MAP_LOCALE_REGISTER_DEBOUNCE_MS);
  }

  function markPending(lang?: MapLanguageCode): void {
    pendingEmit = true;
    if (lang) pendingLangs.add(lang);
    scheduleFlush();
  }

  /** Resolves after the current registration debounce flush (no pending work → immediate). */
  function whenLocaleIdle(): Promise<void> {
    if (!pendingEmit && flushTimer == null) return Promise.resolve();
    return new Promise((resolve) => {
      flushResolvers.push(resolve);
      scheduleFlush();
    });
  }

  function getMapLang() {
    return getStore();
  }

  function getLanguage(): MapLanguageCode {
    return getStore()?.language ?? 'en';
  }

  function getFallbackLanguage(): MapLanguageCode {
    return getStore()?.fallbackLanguage ?? 'en';
  }

  function getLanguages(): MapLanguageCode[] {
    const store = getStore();
    const codes = new Set<string>([...MAP_BUILTIN_LANGUAGES]);
    if (store) {
      for (const k of Object.keys(store.messages)) codes.add(k);
      for (const k of Object.keys(store.languageLabels)) codes.add(k);
      codes.add(store.language);
      codes.add(store.fallbackLanguage);
    }
    return [...codes];
  }

  function registerLocale(lang: MapLanguageCode, tree: MapLangLocale): boolean {
    const store = getStore();
    if (!store) return false;
    const prev = store.messages[lang] ?? {};
    const next = deepMergeLocale(prev, tree);
    if (localeTreesEqual(prev, next)) return false;
    store.messages = {
      ...store.messages,
      [lang]: next,
    };
    markPending(lang);
    return true;
  }

  function registerLocaleFlat(
    lang: MapLanguageCode,
    flat: MapLangFlatMessages,
  ): boolean {
    return registerLocale(lang, unflattenLocaleMessages(flat));
  }

  function registerLanguage(
    lang: MapLanguageCode,
    options?: MapLanguageRegisterOptions,
  ): boolean {
    const store = getStore();
    if (!store) return false;
    let changed = false;
    if (options?.label) {
      if (store.languageLabels[lang] !== options.label) {
        store.languageLabels = {
          ...store.languageLabels,
          [lang]: options.label,
        };
        changed = true;
      }
    } else if (!(lang in store.languageLabels)) {
      store.languageLabels = { ...store.languageLabels, [lang]: lang };
      changed = true;
    }
    if (changed) markPending(lang);
    return changed;
  }

  function setLanguage(lang: MapLanguageCode, persist = true) {
    const store = getStore();
    if (!store) return;
    if (store.language === lang) {
      if (persist) setStoredMapLanguage(lang);
      return;
    }
    store.language = lang;
    if (persist) setStoredMapLanguage(lang);
    emitChanged(getEmitter);
  }

  function setFallbackLanguage(lang: MapLanguageCode) {
    const store = getStore();
    if (!store) return;
    if (store.fallbackLanguage === lang) return;
    store.fallbackLanguage = lang;
    emitChanged(getEmitter);
  }

  function setMapTranslate(translate?: MapTranslateFunction | null) {
    const store = getStore();
    if (!store) return;
    const next = translate || undefined;
    const prev = store.translate;
    if (prev === next || (!prev && !next)) return;
    if (next) {
      store.translate = next;
    } else {
      delete store.translate;
    }
    emitChanged(getEmitter);
  }

  async function loadLocale(
    lang: MapLanguageCode,
    loader: MapLocaleLoader,
    options: MapLoadLocaleOptions = {},
  ): Promise<boolean> {
    const store = getStore();
    if (!store) return false;

    // Skip only if this loader already ran for `lang` (builtins must not block overlays).
    if (!options.force && loadedViaLoader.has(lang)) {
      return true;
    }

    store.loadingLanguages = { ...store.loadingLanguages, [lang]: true };
    emitChanged(getEmitter);

    try {
      const payload = await loader(lang);
      if (payload && typeof payload === 'object') {
        if (isMapLangFlatMessages(payload)) {
          registerLocaleFlat(lang, payload);
        } else {
          registerLocale(lang, payload as MapLangLocale);
        }
        loadedViaLoader.add(lang);
        await whenLocaleIdle();
        return true;
      }
      return false;
    } finally {
      const s = getStore();
      if (s) {
        const next = { ...s.loadingLanguages };
        delete next[lang];
        s.loadingLanguages = next;
        emitChanged(getEmitter);
      }
    }
  }

  return {
    getMapLang,
    getLanguage,
    getFallbackLanguage,
    getLanguages,
    registerLocale,
    registerLocaleFlat,
    registerLanguage,
    setLanguage,
    setFallbackLanguage,
    setMapTranslate,
    loadLocale,
    flushLocaleRegistrations,
    whenLocaleIdle,
  };
}
