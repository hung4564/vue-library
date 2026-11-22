import { registerMapDatasetBuiltinLocales } from '@hungpvq/map-dataset';
import { useLang } from '@hungpvq/vue-map-core';

/** Register map-dataset default catalog (EN) once per mapId. */
export function useEnsureDatasetBuiltinLocales(mapId: string): void {
  const { registerLocale } = useLang(mapId);
  registerMapDatasetBuiltinLocales(mapId, registerLocale);
}
