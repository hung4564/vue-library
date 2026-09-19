import { registerMapDrawBuiltinLocales } from '@hungpvq/map-draw';
import { useLang } from '@hungpvq/react-map-core';
import { useEffect } from 'react';

/** Register map-draw default catalog (EN) once per mapId. */
export function useEnsureDrawBuiltinLocales(mapId: string): void {
  const { registerLocale } = useLang(mapId);
  useEffect(() => {
    registerMapDrawBuiltinLocales(mapId, registerLocale);
  }, [mapId, registerLocale]);
}
