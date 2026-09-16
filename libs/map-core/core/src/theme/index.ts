export { THEME_CONTROL_LOCALE } from './locale';

export const MAP_THEME_IDS = [
  'light',
  'dark',
  'vibrant',
  'ocean',
  'forest',
  'sunset',
  'slate',
] as const;

export type MapThemeId = (typeof MAP_THEME_IDS)[number];
/** Stored / control selection: auto follows system, otherwise a concrete theme id. */
export type MapThemeMode = 'auto' | MapThemeId;
/** Theme class actually applied on `html`. */
export type MapThemeResolved = MapThemeId;

export const MAP_THEME_STORAGE_KEY = 'hungpvq.map-theme-mode';

export const MAP_THEME_CLASS: Record<MapThemeId, string> = {
  light: 'map-theme-light',
  dark: 'map-theme-dark',
  vibrant: 'map-theme-vibrant',
  ocean: 'map-theme-ocean',
  forest: 'map-theme-forest',
  sunset: 'map-theme-sunset',
  slate: 'map-theme-slate',
};

/** Which CSS `color-scheme` each theme uses (form controls, scrollbars). */
export const MAP_THEME_COLOR_SCHEME: Record<MapThemeId, 'light' | 'dark'> = {
  light: 'light',
  dark: 'dark',
  vibrant: 'light',
  ocean: 'light',
  forest: 'light',
  sunset: 'light',
  slate: 'dark',
};

/** Default theme list for ThemeControl (auto + every named theme). */
export const MAP_THEME_MODES: MapThemeMode[] = ['auto', ...MAP_THEME_IDS];

const ALL_THEME_CLASSES = Object.values(MAP_THEME_CLASS);
export const MAP_THEME_CONTRAST_CLASS = 'map-theme-contrast';

export function isMapThemeId(value: unknown): value is MapThemeId {
  return (
    typeof value === 'string' &&
    (MAP_THEME_IDS as readonly string[]).includes(value)
  );
}

export function isMapThemeMode(value: unknown): value is MapThemeMode {
  return value === 'auto' || isMapThemeId(value);
}

export function resolveMapTheme(
  mode: MapThemeMode,
  prefersDark = getPrefersDark(),
): MapThemeResolved {
  if (mode === 'auto') return prefersDark ? 'dark' : 'light';
  return mode;
}

export function getPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function getPrefersContrastMore(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-contrast: more)').matches;
}

/** Apply or remove high-contrast chrome class on `document.documentElement`. */
export function applyMapThemeContrastClass(
  enabled = getPrefersContrastMore(),
): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (enabled) root.classList.add(MAP_THEME_CONTRAST_CLASS);
  else root.classList.remove(MAP_THEME_CONTRAST_CLASS);
}

/**
 * Subscribe to `prefers-contrast: more`. Returns unsubscribe.
 */
export function subscribePrefersContrastMore(
  onChange: (matches: boolean) => void,
): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => undefined;
  }
  const mq = window.matchMedia('(prefers-contrast: more)');
  const handler = (event: MediaQueryListEvent) => onChange(event.matches);
  onChange(mq.matches);
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}

export function getStoredMapThemeMode(
  fallback: MapThemeMode = 'auto',
): MapThemeMode {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(MAP_THEME_STORAGE_KEY);
    return isMapThemeMode(raw) ? raw : fallback;
  } catch {
    return fallback;
  }
}

export function setStoredMapThemeMode(mode: MapThemeMode): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(MAP_THEME_STORAGE_KEY, mode);
  } catch {
    // ignore quota / private mode
  }
}

export function cycleMapThemeMode(mode: MapThemeMode): MapThemeMode {
  const index = MAP_THEME_MODES.indexOf(mode);
  const i = index < 0 ? 0 : index;
  return MAP_THEME_MODES[(i + 1) % MAP_THEME_MODES.length];
}

/** Opposite of current resolved scheme: dark → light, otherwise → dark. */
export function toggleMapThemeLightDark(
  resolved: MapThemeResolved,
): 'light' | 'dark' {
  return MAP_THEME_COLOR_SCHEME[resolved] === 'dark' ? 'light' : 'dark';
}

export function normalizeMapThemeModes(
  themes: readonly unknown[] | undefined,
  fallback: readonly MapThemeMode[] = MAP_THEME_MODES,
): MapThemeMode[] {
  if (!themes?.length) return [...fallback];
  const next: MapThemeMode[] = [];
  for (const item of themes) {
    if (isMapThemeMode(item) && !next.includes(item)) next.push(item);
  }
  return next.length > 0 ? next : [...fallback];
}

export function getMapThemeLocaleKey(mode: MapThemeMode): string {
  return `map.theme-control.${mode}`;
}

/** Apply resolved theme class on `document.documentElement` (html). */
export function applyMapThemeClass(resolved: MapThemeResolved): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove(...ALL_THEME_CLASSES);
  root.classList.add(MAP_THEME_CLASS[resolved]);
  root.style.colorScheme = MAP_THEME_COLOR_SCHEME[resolved];
  applyMapThemeContrastClass();
}

/** Read stored mode (or fallback), resolve, and apply to html. */
export function bootstrapMapTheme(fallback: MapThemeMode = 'auto'): {
  mode: MapThemeMode;
  resolved: MapThemeResolved;
} {
  const mode = getStoredMapThemeMode(fallback);
  const resolved = resolveMapTheme(mode);
  applyMapThemeClass(resolved);
  return { mode, resolved };
}
