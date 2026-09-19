<template>
  <Map>
    <DevtoolsControl position="bottom-right" />
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
import { DevtoolsControl } from '@hungpvq/vue-map-devtools';
import {
  MAP_CORE_LOCALE_VI,
  type MapLangFlatMessages,
  type MapLangLocale,
  type MapLanguageCode,
} from '@hungpvq/map-core';
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
  vi: MAP_CORE_LOCALE_VI,
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


