/**
 * Shared LanguageControl: default VI.
 * Package default catalogs (EN) seed once per lib; extra langs via `locales`.
 */
import { deepMergeLocale, MAP_CORE_LOCALE_VI } from '@hungpvq/map-core';
import { MAP_DATASET_LOCALE_VI } from '@hungpvq/map-dataset';
import { MAP_DRAW_LOCALE_VI } from '@hungpvq/map-draw';
import { LanguageControl } from '@hungpvq/react-map-core';
import { useMemo } from 'react';

export function DemoLanguageControl() {
  const locales = useMemo(
    () => ({
      vi: deepMergeLocale(
        deepMergeLocale(MAP_CORE_LOCALE_VI, MAP_DATASET_LOCALE_VI),
        MAP_DRAW_LOCALE_VI,
      ),
    }),
    [],
  );

  return (
    <LanguageControl
      defaultLanguage="vi"
      languages={['en', 'vi']}
      locales={locales}
    />
  );
}
