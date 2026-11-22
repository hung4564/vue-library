import { registerMapDatasetBuiltinLocales } from '@hungpvq/map-dataset';
import { useLang } from '@hungpvq/react-map-core';
import { useEffect } from 'react';

/** Register map-dataset default catalog (EN) once per mapId. */
export function useEnsureDatasetBuiltinLocales(mapId: string): void {
  const { registerLocale } = useLang(mapId);
  useEffect(() => {
    registerMapDatasetBuiltinLocales(mapId, registerLocale);
  }, [mapId, registerLocale]);
}
