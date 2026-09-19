import type { MapLangLocale, MapLanguageCode } from '../types/lang';
import { MAP_DEFAULT_CATALOG_LANGUAGE } from '../types/lang';
import { registerMapStoreCleanup } from '../store/map-platform-registry';
import { MAP_CORE_LOCALE_EN } from './locale.en';

export type RegisterLocaleFn = (
  code: MapLanguageCode,
  tree: MapLangLocale,
) => unknown;

const seededMapIds = new Set<string>();
const CLEANUP_KEY = 'locale:map-core';

/**
 * Register map-core **default catalog** (EN) once per mapId.
 * Other languages: LanguageControl `locales` / `loadLocale` / `registerLocale`.
 */
export function registerMapCoreBuiltinLocales(
  mapId: string,
  registerLocale: RegisterLocaleFn,
): void {
  if (!mapId || seededMapIds.has(mapId)) return;
  seededMapIds.add(mapId);
  registerLocale(MAP_DEFAULT_CATALOG_LANGUAGE, MAP_CORE_LOCALE_EN);
  registerMapStoreCleanup(mapId, CLEANUP_KEY, () => {
    seededMapIds.delete(mapId);
  });
}

/** @internal test helper */
export function resetMapCoreBuiltinLocaleSeedForTests(): void {
  seededMapIds.clear();
}
