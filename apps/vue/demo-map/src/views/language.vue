<template>
  <Map>
    <AsideControl position="top-left" />
    <LanguageControl
      default-language="vi"
      :languages="['en', 'vi', 'fr']"
      :labels="langLabels"
      :locales="extraLocales"
      :locale-loader="localeLoader"
      :reload-on-select="reloadOnSelect"
    />
    <ThemeControl />
    <HomeControl />
    <ZoomControl />
    <GotoControl position="top-right" />
    <InfoControl position="top-right" />
    <MeasurementControl position="top-right" />
    <BaseMapControl position="bottom-left" />
    <MouseCoordinatesControl />
    <DemoHelpPanel />
    <LanguageReloadToggle v-model="reloadOnSelect" />
  </Map>
</template>

<script setup lang="ts">
import {
  deepMergeLocale,
  type MapLangFlatMessages,
  type MapLangLocale,
  type MapLanguageCode,
} from '@hungpvq/map-core';
import { MAP_DATASET_LOCALE_EN, MAP_DATASET_LOCALE_VI } from '@hungpvq/map-dataset';
import { MAP_DRAW_LOCALE_EN, MAP_DRAW_LOCALE_VI } from '@hungpvq/map-draw';
import {
  BaseMapControl,
  GotoControl,
  HomeControl,
  InfoControl,
  LanguageControl,
  Map,
  MeasurementControl,
  MouseCoordinatesControl,
  ThemeControl,
  ZoomControl,
} from '@hungpvq/vue-map-core';
import { ref } from 'vue';
import AsideControl from '../layout/aside-control.vue';
import DemoHelpPanel from '../components/DemoHelpPanel.vue';
import LanguageReloadToggle from '../components/LanguageReloadToggle.vue';

const reloadOnSelect = ref(false);

const langLabels = {
  en: 'English',
  vi: 'Tiếng Việt',
  fr: 'Français',
};

const FR_LOCALE: MapLangLocale = {
  map: {
    'language-control': {
      title: 'Langue',
      en: 'English',
      vi: 'Vietnamien',
      fr: 'Français',
    },
    home: { title: 'Vue par défaut' },
    basemap: { title: 'Fond de carte', setting: 'Réglages' },
    measurement: { title: 'Mesure' },
  },
};

const extraLocales = {
  en: deepMergeLocale(MAP_DATASET_LOCALE_EN, MAP_DRAW_LOCALE_EN),
  vi: deepMergeLocale(MAP_DATASET_LOCALE_VI, MAP_DRAW_LOCALE_VI),
  fr: FR_LOCALE,
};

async function localeLoader(
  lang: MapLanguageCode,
): Promise<MapLangFlatMessages | null> {
  try {
    const base = import.meta.env.BASE_URL || '/';
    const res = await fetch(
      `${base}demo-i18n/${lang}.json`.replace(/\/{2,}/g, '/'),
    );
    if (!res.ok) return null;
    return (await res.json()) as MapLangFlatMessages;
  } catch {
    return null;
  }
}
</script>

<style>
* {
  padding: 0;
  margin: 0;
}
body,
html,
#root {
  height: 100%;
}
</style>
