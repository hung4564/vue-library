import { afterEach, describe, expect, it } from 'vitest';
import {
  MAP_THEME_CLASS,
  MAP_THEME_STORAGE_KEY,
  applyMapTheme,
  applyMapThemeClass,
  applyMapThemeForMap,
  bootstrapMapTheme,
  cycleMapThemeMode,
  getMapThemeLocaleKey,
  getMapThemeStorageKey,
  getPrefersDark,
  getStoredMapThemeMode,
  isMapThemeId,
  isMapThemeMode,
  normalizeMapThemeModes,
  resolveMapTheme,
  resolveMapThemeElement,
  setStoredMapThemeMode,
  toggleMapThemeLightDark,
} from './index';

const memory = new Map<string, string>();

afterEach(() => {
  memory.clear();
});

describe('theme helpers', () => {
  it('isMapThemeId / isMapThemeMode accept known values only', () => {
    expect(isMapThemeId('dark')).toBe(true);
    expect(isMapThemeId('auto')).toBe(false);
    expect(isMapThemeMode('auto')).toBe(true);
    expect(isMapThemeMode('dark')).toBe(true);
    expect(isMapThemeMode('nope')).toBe(false);
  });

  it('resolveMapTheme maps auto to light/dark from prefersDark', () => {
    expect(resolveMapTheme('auto', false)).toBe('light');
    expect(resolveMapTheme('auto', true)).toBe('dark');
    expect(resolveMapTheme('ocean', true)).toBe('ocean');
  });

  it('cycleMapThemeMode walks the mode list', () => {
    expect(cycleMapThemeMode('auto')).toBe('light');
    expect(cycleMapThemeMode('slate')).toBe('auto');
    expect(cycleMapThemeMode('unknown' as never)).toBe('light');
  });

  it('toggleMapThemeLightDark flips by color scheme', () => {
    expect(toggleMapThemeLightDark('dark')).toBe('light');
    expect(toggleMapThemeLightDark('light')).toBe('dark');
    expect(toggleMapThemeLightDark('slate')).toBe('light');
  });

  it('normalizeMapThemeModes filters invalid and dedupes', () => {
    expect(normalizeMapThemeModes(['dark', 'dark', 'x', 'auto'])).toEqual([
      'dark',
      'auto',
    ]);
    expect(normalizeMapThemeModes([])).toContain('auto');
    expect(normalizeMapThemeModes(undefined)).toContain('light');
  });

  it('getMapThemeLocaleKey builds control locale paths', () => {
    expect(getMapThemeLocaleKey('auto')).toBe('map.theme-control.auto');
    expect(getMapThemeLocaleKey('ocean')).toBe('map.theme-control.ocean');
  });

  it('reads and writes theme mode via localStorage when available', () => {
    const original = globalThis.localStorage;
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => memory.get(key) ?? null,
        setItem: (key: string, value: string) => {
          memory.set(key, value);
        },
      },
    });

    expect(getStoredMapThemeMode('auto')).toBe('auto');
    setStoredMapThemeMode('forest');
    expect(memory.get(MAP_THEME_STORAGE_KEY)).toBe('forest');
    expect(getStoredMapThemeMode()).toBe('forest');

    memory.set(MAP_THEME_STORAGE_KEY, 'not-a-theme');
    expect(getStoredMapThemeMode('ocean')).toBe('ocean');

    setStoredMapThemeMode('dark', { mapId: 'map-a' });
    expect(memory.get(`${MAP_THEME_STORAGE_KEY}:map-a`)).toBe('dark');
    expect(getStoredMapThemeMode('auto', { mapId: 'map-a' })).toBe('dark');
    // global key still invalid → fallback
    expect(getStoredMapThemeMode('auto')).toBe('auto');

    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: original,
    });
  });

  it('getMapThemeStorageKey scopes by mapId', () => {
    expect(getMapThemeStorageKey()).toBe(MAP_THEME_STORAGE_KEY);
    expect(getMapThemeStorageKey('m1')).toBe(`${MAP_THEME_STORAGE_KEY}:m1`);
  });

  it('applyMapThemeClass updates documentElement when document exists', () => {
    const classes = new Set<string>([MAP_THEME_CLASS.light]);
    const style = { colorScheme: '' };
    const originalDocument = globalThis.document;
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: {
        documentElement: {
          classList: {
            remove: (...names: string[]) => {
              names.forEach((name) => classes.delete(name));
            },
            add: (name: string) => {
              classes.add(name);
            },
          },
          style,
        },
      },
    });

    applyMapThemeClass('dark');
    expect(classes.has(MAP_THEME_CLASS.dark)).toBe(true);
    expect(classes.has(MAP_THEME_CLASS.light)).toBe(false);
    expect(style.colorScheme).toBe('dark');

    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: originalDocument,
    });
  });

  it('getPrefersDark uses matchMedia when window exists', () => {
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        matchMedia: (query: string) => ({
          matches: query.includes('dark'),
        }),
      },
    });
    expect(getPrefersDark()).toBe(true);
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  });

  it('bootstrapMapTheme reads storage, resolves, and applies class', () => {
    const store = new Map<string, string>([[MAP_THEME_STORAGE_KEY, 'ocean']]);
    const classes = new Set<string>();
    const style = { colorScheme: '' };
    const originalDocument = globalThis.document;
    const originalStorage = globalThis.localStorage;
    const originalWindow = globalThis.window;

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        matchMedia: () => ({ matches: false }),
      },
    });
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
      },
    });
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: {
        documentElement: {
          classList: {
            remove: (...names: string[]) => {
              names.forEach((name) => classes.delete(name));
            },
            add: (name: string) => {
              classes.add(name);
            },
          },
          style,
        },
      },
    });

    const result = bootstrapMapTheme('auto');
    expect(result).toEqual({ mode: 'ocean', resolved: 'ocean' });
    expect(classes.has(MAP_THEME_CLASS.ocean)).toBe(true);

    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: originalDocument,
    });
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: originalStorage,
    });
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  });

  it('applyMapThemeForMap targets map container without touching documentElement', () => {
    const mapClasses = new Set<string>();
    const htmlClasses = new Set<string>([MAP_THEME_CLASS.light]);
    const mapStyle = { colorScheme: '' };
    const htmlStyle = { colorScheme: 'light' };
    const originalDocument = globalThis.document;
    const originalWindow = globalThis.window;

    const mapEl = {
      classList: {
        remove: (...names: string[]) => {
          names.forEach((name) => mapClasses.delete(name));
        },
        add: (name: string) => {
          mapClasses.add(name);
        },
      },
      style: mapStyle,
    };

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        matchMedia: () => ({ matches: false }),
      },
    });
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: {
        documentElement: {
          classList: {
            remove: (...names: string[]) => {
              names.forEach((name) => htmlClasses.delete(name));
            },
            add: (name: string) => {
              htmlClasses.add(name);
            },
          },
          style: htmlStyle,
        },
        querySelector: (sel: string) =>
          sel.includes('data-map-id') ? mapEl : null,
      },
    });

    expect(resolveMapThemeElement('m1')).toBe(mapEl);
    expect(applyMapThemeForMap('m1', 'dark')).toBe(true);
    expect(mapClasses.has(MAP_THEME_CLASS.dark)).toBe(true);
    expect(htmlClasses.has(MAP_THEME_CLASS.light)).toBe(true);
    expect(htmlClasses.has(MAP_THEME_CLASS.dark)).toBe(false);
    expect(mapStyle.colorScheme).toBe('dark');
    expect(htmlStyle.colorScheme).toBe('light');

    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: originalDocument,
    });
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  });

  it('applyMapTheme scope=map leaves html alone; document mirrors map shell', () => {
    const mapClasses = new Set<string>();
    const htmlClasses = new Set<string>([MAP_THEME_CLASS.light]);
    const mapStyle = { colorScheme: '' };
    const htmlStyle = { colorScheme: 'light' };
    const originalDocument = globalThis.document;
    const originalWindow = globalThis.window;

    const mapEl = {
      classList: {
        remove: (...names: string[]) => {
          names.forEach((name) => mapClasses.delete(name));
        },
        add: (name: string) => {
          mapClasses.add(name);
        },
      },
      style: mapStyle,
    };

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { matchMedia: () => ({ matches: false }) },
    });
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: {
        documentElement: {
          classList: {
            remove: (...names: string[]) => {
              names.forEach((name) => htmlClasses.delete(name));
            },
            add: (name: string) => {
              htmlClasses.add(name);
            },
          },
          style: htmlStyle,
        },
        querySelector: (sel: string) =>
          sel.includes('data-map-id') ? mapEl : null,
      },
    });

    expect(applyMapTheme('ocean', { scope: 'map', mapId: 'm1' })).toBe(true);
    expect(mapClasses.has(MAP_THEME_CLASS.ocean)).toBe(true);
    expect(htmlClasses.has(MAP_THEME_CLASS.light)).toBe(true);
    expect(htmlClasses.has(MAP_THEME_CLASS.ocean)).toBe(false);

    expect(applyMapTheme('dark', { scope: 'document', mapId: 'm1' })).toBe(
      true,
    );
    expect(htmlClasses.has(MAP_THEME_CLASS.dark)).toBe(true);
    expect(mapClasses.has(MAP_THEME_CLASS.dark)).toBe(true);

    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: originalDocument,
    });
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  });
});
