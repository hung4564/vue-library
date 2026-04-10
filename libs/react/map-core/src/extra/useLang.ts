/**
 * Placeholder for useLang hook
 * Full implementation would be in extra/lang (not migrated yet)
 */

import { useState, useCallback } from 'react';

type LocaleData = Record<string, any>;

const defaultLocales: Record<string, LocaleData> = {};

export function useLang(mapId: string) {
  const [locale, setLocale] = useState<LocaleData>(() => {
    // Initialize with existing defaults if any
    return defaultLocales[mapId] ? { ...defaultLocales[mapId] } : {};
  });

  const setLocaleDefault = useCallback(
    (data: LocaleData) => {
      if (!defaultLocales[mapId]) {
        defaultLocales[mapId] = {};
      }

      // Just merge into defaults - don't trigger state update
      // State will use defaults when trans() is called
      defaultLocales[mapId] = { ...defaultLocales[mapId], ...data };
    },
    [mapId],
  );

  const trans = useCallback(
    (key: string): string => {
      const keys = key.split('.');
      let value: any = locale;
      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) {
          // Fallback to default locale
          value = defaultLocales[mapId];
          for (const k2 of keys) {
            value = value?.[k2];
            if (value === undefined) return key;
          }
          break;
        }
      }
      return typeof value === 'string' ? value : key;
    },
    [locale, mapId],
  );

  return { trans, setLocaleDefault };
}
