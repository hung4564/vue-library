import { describe, expect, it } from 'vitest';
import {
  createDefaultLangStore,
  createMapLocaleApi,
  flattenLocaleMessages,
  getStoredMapLanguage,
  isMapLangFlatMessages,
  mapLanguageCodeLabel,
  MittTypeMapLangEventKey,
  nextMapLanguageInList,
  registerLanguageControlPacks,
  resolveInitialMapLanguage,
  setStoredMapLanguage,
  translateMapLang,
  unflattenLocaleMessages,
} from './lang';

describe('locale flat helpers', () => {
  it('unflattens and flattens dotted keys', () => {
    const flat = {
      'map.home.title': 'Home',
      'map.basemap.setting': 'Setting',
    };
    const nested = unflattenLocaleMessages(flat);
    expect(nested).toEqual({
      map: {
        home: { title: 'Home' },
        basemap: { setting: 'Setting' },
      },
    });
    expect(flattenLocaleMessages(nested)).toEqual(flat);
  });

  it('detects flat vs nested payloads', () => {
    expect(isMapLangFlatMessages({ 'map.home.title': 'A' })).toBe(true);
    expect(isMapLangFlatMessages({ map: { home: { title: 'A' } } })).toBe(
      false,
    );
  });
});

describe('createMapLocaleApi', () => {
  it('registers locale catalogs and translates with fallback', () => {
    const store = createDefaultLangStore();
    const emitted: string[] = [];
    const api = createMapLocaleApi({
      getStore: () => store,
      getEmitter: () => ({
        emit: (key) => emitted.push(key),
      }),
    });

    api.registerLocale('en', {
      map: { home: { title: 'Default view' } },
    });
    api.registerLocale('vi', {
      map: { home: { title: 'Về mặc định' } },
    });
    api.setLanguage('vi', false);

    expect(translateMapLang(store, 'map.home.title')).toBe('Về mặc định');
    expect(translateMapLang(store, 'map.missing')).toBe('map.missing');

    api.setLanguage('en', false);
    expect(translateMapLang(store, 'map.home.title')).toBe('Default view');
    expect(emitted.length).toBeGreaterThan(0);
    expect(emitted.every((e) => e === MittTypeMapLangEventKey.changed)).toBe(
      true,
    );
  });

  it('falls back to fallbackLanguage when active key missing', () => {
    const store = createDefaultLangStore({
      language: 'vi',
      fallbackLanguage: 'en',
    });
    const api = createMapLocaleApi({ getStore: () => store });
    api.registerLocale('en', { map: { home: { title: 'Home EN' } } });
    api.registerLocale('vi', { map: { basemap: { title: 'Nền' } } });

    expect(translateMapLang(store, 'map.home.title')).toBe('Home EN');
    expect(translateMapLang(store, 'map.basemap.title')).toBe('Nền');
  });

  it('overrides via deep-merge registerLocale', () => {
    const store = createDefaultLangStore();
    const api = createMapLocaleApi({ getStore: () => store });
    api.registerLocale('vi', { map: { home: { title: 'A' } } });
    api.registerLocale('vi', { map: { home: { title: 'B' } } });
    api.setLanguage('vi', false);
    expect(translateMapLang(store, 'map.home.title')).toBe('B');
  });

  it('registerLocale is idempotent — no emit when pack already merged', () => {
    const store = createDefaultLangStore();
    const emitted: string[] = [];
    const api = createMapLocaleApi({
      getStore: () => store,
      getEmitter: () => ({
        emit: (e) => {
          emitted.push(e);
        },
      }),
    });
    const pack = { map: { home: { title: 'Home' } } };
    expect(api.registerLocale('en', pack)).toBe(true);
    expect(emitted).toHaveLength(1);
    expect(api.registerLocale('en', pack)).toBe(false);
    expect(emitted).toHaveLength(1);
    expect(api.registerLocale('en', { map: { home: { title: 'Home' } } })).toBe(
      false,
    );
    expect(emitted).toHaveLength(1);
  });

  it('registerLocaleFlat merges unflattened keys', () => {
    const store = createDefaultLangStore({ language: 'vi' });
    const api = createMapLocaleApi({ getStore: () => store });
    api.registerLocaleFlat('vi', { 'map.home.title': 'Nhà' });
    expect(translateMapLang(store, 'map.home.title')).toBe('Nhà');
  });

  it('loadLocale fetches flat KV and registers', async () => {
    const store = createDefaultLangStore();
    const api = createMapLocaleApi({ getStore: () => store });
    const ok = await api.loadLocale('vi', async () => ({
      'map.home.title': 'Từ API',
    }));
    expect(ok).toBe(true);
    api.setLanguage('vi', false);
    expect(translateMapLang(store, 'map.home.title')).toBe('Từ API');
    expect(store.loadingLanguages['vi']).toBeUndefined();
  });

  it('loadLocale skips when catalog exists unless force', async () => {
    const store = createDefaultLangStore();
    const api = createMapLocaleApi({ getStore: () => store });
    api.registerLocale('vi', { map: { home: { title: 'First' } } });
    let calls = 0;
    await api.loadLocale('vi', async () => {
      calls += 1;
      return { 'map.home.title': 'Second' };
    });
    expect(calls).toBe(0);
    await api.loadLocale(
      'vi',
      async () => {
        calls += 1;
        return { 'map.home.title': 'Second' };
      },
      { force: true },
    );
    expect(calls).toBe(1);
    api.setLanguage('vi', false);
    expect(translateMapLang(store, 'map.home.title')).toBe('Second');
  });

  it('setMapTranslate can fall back to catalogs', () => {
    const store = createDefaultLangStore({ language: 'en' });
    const api = createMapLocaleApi({ getStore: () => store });
    api.registerLocale('en', { map: { home: { title: 'Home EN' } } });
    api.setMapTranslate((key, _params, fallback) => {
      if (key === 'map.custom') return 'From i18n';
      return fallback?.() ?? key;
    });
    expect(translateMapLang(store, 'map.custom')).toBe('From i18n');
    expect(translateMapLang(store, 'map.home.title')).toBe('Home EN');
  });

  it('setMapTranslate(null) clears custom translator', () => {
    const store = createDefaultLangStore();
    const api = createMapLocaleApi({ getStore: () => store });
    api.registerLocale('en', { map: { home: { title: 'Home' } } });
    api.setMapTranslate(() => 'X');
    expect(translateMapLang(store, 'map.home.title')).toBe('X');
    api.setMapTranslate(null);
    expect(translateMapLang(store, 'map.home.title')).toBe('Home');
  });

  it('setMapTranslate bypasses catalogs when no fallback used', () => {
    const store = createDefaultLangStore();
    const api = createMapLocaleApi({ getStore: () => store });
    api.setMapTranslate((key) => key.toUpperCase());
    expect(translateMapLang(store, 'map.home.title')).toBe('MAP.HOME.TITLE');
  });

  it('registerLanguage stores labels', () => {
    const store = createDefaultLangStore();
    const api = createMapLocaleApi({ getStore: () => store });
    api.registerLanguage('fr', { label: 'Français' });
    expect(store.languageLabels['fr']).toBe('Français');
    expect(api.getLanguages()).toContain('fr');
  });

  it('returns store via getMapLang', () => {
    const store = createDefaultLangStore();
    const api = createMapLocaleApi({ getStore: () => store });
    expect(api.getMapLang()).toBe(store);
  });
});

describe('map language storage', () => {
  it('reads and writes language via localStorage when available', () => {
    const original = globalThis.localStorage;
    const mem = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (k: string) => mem.get(k) ?? null,
        setItem: (k: string, v: string) => {
          mem.set(k, v);
        },
      },
    });
    expect(getStoredMapLanguage('en')).toBe('en');
    setStoredMapLanguage('vi');
    expect(getStoredMapLanguage()).toBe('vi');
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: original,
    });
  });
});

describe('LanguageControl bootstrap helpers', () => {
  it('labels codes uppercase and cycles languages', () => {
    expect(mapLanguageCodeLabel('vi')).toBe('VI');
    expect(nextMapLanguageInList(['en', 'vi', 'fr'], 'vi')).toBe('fr');
    expect(nextMapLanguageInList(['en', 'vi'], 'vi')).toBe('en');
  });

  it('resolves initial language from storage when allowed', () => {
    const original = globalThis.localStorage;
    const mem = new Map<string, string>([['hungpvq.map-language', 'fr']]);
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (k: string) => mem.get(k) ?? null,
        setItem: (k: string, v: string) => {
          mem.set(k, v);
        },
      },
    });
    expect(resolveInitialMapLanguage(['en', 'vi'], 'vi')).toBe('vi');
    expect(resolveInitialMapLanguage(['en', 'vi', 'fr'], 'vi')).toBe('fr');
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: original,
    });
  });

  it('registers EN/VI packs and extra locales', () => {
    const registered: Record<string, unknown> = {};
    const labels: Record<string, string> = {};
    registerLanguageControlPacks({
      registerLocale: (code, tree) => {
        registered[code] = tree;
      },
      registerLanguage: (code, opts) => {
        labels[code] = opts?.label ?? code;
      },
      coreLocaleEn: { map: { home: { title: 'Home' } } },
      coreLocaleVi: { map: { home: { title: 'Nhà' } } },
      locales: {
        en: { map: { basemap: { title: 'Basemap' } } },
        fr: { map: { home: { title: 'Accueil' } } },
      },
      labels: { fr: 'Français' },
      languages: ['en', 'vi', 'fr'],
    });
    expect(registered['en']).toBeTruthy();
    expect(registered['vi']).toBeTruthy();
    expect(registered['fr']).toEqual({ map: { home: { title: 'Accueil' } } });
    expect(labels['fr']).toBe('Français');
    expect(labels['en']).toBe('EN');
  });
});
