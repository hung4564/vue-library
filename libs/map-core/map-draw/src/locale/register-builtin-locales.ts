import {
  MAP_DEFAULT_CATALOG_LANGUAGE,
  registerMapStoreCleanup,
  type MapLangLocale,
  type MapLanguageCode,
} from '@hungpvq/map-core';
import { MAP_DRAW_LOCALE_EN } from './locale.en';

type RegisterLocaleFn = (
  code: MapLanguageCode,
  tree: MapLangLocale,
) => unknown;

const seededMapIds = new Set<string>();
const CLEANUP_KEY = 'locale:map-draw';

/** Register map-draw **default catalog** (EN) once per mapId. */
export function registerMapDrawBuiltinLocales(
  mapId: string,
  registerLocale: RegisterLocaleFn,
): void {
  if (!mapId || seededMapIds.has(mapId)) return;
  seededMapIds.add(mapId);
  registerLocale(
    MAP_DEFAULT_CATALOG_LANGUAGE,
    MAP_DRAW_LOCALE_EN as MapLangLocale,
  );
  registerMapStoreCleanup(mapId, CLEANUP_KEY, () => {
    seededMapIds.delete(mapId);
  });
}
