import { registerMapDrawBuiltinLocales } from '@hungpvq/map-draw';
import { useLang } from '@hungpvq/react-map-core';
import { useEffect } from 'react';

/** Register map-draw EN/VI catalogs once per mapId (package-owned). */
export function useEnsureDrawBuiltinLocales(mapId: string): void {
  const { registerLocale } = useLang(mapId);
  useEffect(() => {
    registerMapDrawBuiltinLocales(mapId, registerLocale);
  }, [mapId, registerLocale]);
}
