import { registerMapDrawBuiltinLocales } from '@hungpvq/map-draw';
import { useLang } from '@hungpvq/vue-map-core';

/** Register map-draw EN/VI catalogs once per mapId (package-owned). */
export function useEnsureDrawBuiltinLocales(mapId: string): void {
  const { registerLocale } = useLang(mapId);
  registerMapDrawBuiltinLocales(mapId, registerLocale);
}
