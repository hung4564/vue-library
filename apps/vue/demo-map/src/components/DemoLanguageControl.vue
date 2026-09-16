<script setup lang="ts">
/**
 * Shared LanguageControl for all demo maps: default VI, EN+VI packs (core+dataset+draw).
 */
import { deepMergeLocale } from '@hungpvq/map-core';
import { MAP_DATASET_LOCALE_EN, MAP_DATASET_LOCALE_VI } from '@hungpvq/map-dataset';
import { MAP_DRAW_LOCALE_EN, MAP_DRAW_LOCALE_VI } from '@hungpvq/map-draw';
import { LanguageControl } from '@hungpvq/vue-map-core';

const locales = {
  en: deepMergeLocale(MAP_DATASET_LOCALE_EN, MAP_DRAW_LOCALE_EN),
  vi: deepMergeLocale(MAP_DATASET_LOCALE_VI, MAP_DRAW_LOCALE_VI),
};
</script>

<template>
  <LanguageControl
    default-language="vi"
    :languages="['en', 'vi']"
    :locales="locales"
  />
</template>
