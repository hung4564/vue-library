import { afterEach, describe, expect, it } from 'vitest';
import {
  MAP_THEME_CLASS,
  MAP_THEME_STORAGE_KEY,
  applyMapThemeClass,
  bootstrapMapTheme,
  cycleMapThemeMode,
  getMapThemeLocaleKey,
  getPrefersDark,
  getStoredMapThemeMode,
  isMapThemeId,
  isMapThemeMode,
  normalizeMapThemeModes,
  resolveMapTheme,
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

    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: original,
    });
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
    const memory = new Map<string, string>([[MAP_THEME_STORAGE_KEY, 'ocean']]);
    const classes = new Set<string>();
    const style = { colorScheme: '' };
    const originalDocument = globalThis.document;
    const originalStorage = globalThis.localStorage;

    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => memory.get(key) ?? null,
        setItem: (key: string, value: string) => {
          memory.set(key, value);
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
  });
});
