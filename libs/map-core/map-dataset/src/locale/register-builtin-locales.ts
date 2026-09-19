import {
  MAP_DEFAULT_CATALOG_LANGUAGE,
  registerMapStoreCleanup,
  type MapLangLocale,
  type MapLanguageCode,
} from '@hungpvq/map-core';
import { MAP_DATASET_LOCALE_EN } from './locale.en';

export type RegisterLocaleFn = (
  code: MapLanguageCode,
  tree: MapLangLocale,
) => unknown;

const seededMapIds = new Set<string>();
const CLEANUP_KEY = 'locale:map-dataset';

/** Register map-dataset **default catalog** (EN) once per mapId. */
export function registerMapDatasetBuiltinLocales(
  mapId: string,
  registerLocale: RegisterLocaleFn,
): void {
  if (!mapId || seededMapIds.has(mapId)) return;
  seededMapIds.add(mapId);
  registerLocale(
    MAP_DEFAULT_CATALOG_LANGUAGE,
    MAP_DATASET_LOCALE_EN as MapLangLocale,
  );
  registerMapStoreCleanup(mapId, CLEANUP_KEY, () => {
    seededMapIds.delete(mapId);
  });
}

/** @internal test helper */
export function resetMapDatasetBuiltinLocaleSeedForTests(): void {
  seededMapIds.clear();
}
