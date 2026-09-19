import { registerMapDrawBuiltinLocales } from '@hungpvq/map-draw';
import { useLang } from '@hungpvq/vue-map-core';

/** Register map-draw default catalog (EN) once per mapId. */
export function useEnsureDrawBuiltinLocales(mapId: string): void {
  const { registerLocale } = useLang(mapId);
  registerMapDrawBuiltinLocales(mapId, registerLocale);
}
