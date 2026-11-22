<script setup lang="ts">
/**
 * Shared LanguageControl: default VI.
 * Package default catalogs (EN) seed once per lib; extra langs via `locales`.
 */
import { deepMergeLocale, MAP_CORE_LOCALE_VI } from '@hungpvq/map-core';
import { MAP_DATASET_LOCALE_VI } from '@hungpvq/map-dataset';
import { MAP_DRAW_LOCALE_VI } from '@hungpvq/map-draw';
import { LanguageControl } from '@hungpvq/vue-map-core';

const locales = {
  vi: deepMergeLocale(
    deepMergeLocale(MAP_CORE_LOCALE_VI, MAP_DATASET_LOCALE_VI),
    MAP_DRAW_LOCALE_VI,
  ),
};
</script>

<template>
  <LanguageControl
    default-language="vi"
    :languages="['en', 'vi']"
    :locales="locales"
  />
</template>
