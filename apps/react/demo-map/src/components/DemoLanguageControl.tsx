/**
 * Shared LanguageControl for all demo maps: default VI, EN+VI packs (core+dataset+draw).
 */
import { deepMergeLocale } from '@hungpvq/map-core';
import { MAP_DATASET_LOCALE_EN, MAP_DATASET_LOCALE_VI } from '@hungpvq/map-dataset';
import { MAP_DRAW_LOCALE_EN, MAP_DRAW_LOCALE_VI } from '@hungpvq/map-draw';
import { LanguageControl } from '@hungpvq/react-map-core';
import { useMemo } from 'react';

export function DemoLanguageControl() {
  const locales = useMemo(
    () => ({
      en: deepMergeLocale(MAP_DATASET_LOCALE_EN, MAP_DRAW_LOCALE_EN),
      vi: deepMergeLocale(MAP_DATASET_LOCALE_VI, MAP_DRAW_LOCALE_VI),
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
