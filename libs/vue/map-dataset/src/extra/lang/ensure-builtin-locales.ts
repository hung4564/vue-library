import { registerMapDatasetBuiltinLocales } from '@hungpvq/map-dataset';
import { useLang } from '@hungpvq/vue-map-core';

/**
 * Register map-dataset EN/VI catalogs once per mapId (package-owned).
 */
export function useEnsureDatasetBuiltinLocales(mapId: string): void {
  const { registerLocale } = useLang(mapId);
  registerMapDatasetBuiltinLocales(mapId, registerLocale);
}
