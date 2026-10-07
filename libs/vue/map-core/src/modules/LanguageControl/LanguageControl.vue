<script setup lang="ts">
import {
  MAP_BUILTIN_LANGUAGES,
  type MapLangLocale,
  type MapLanguageCode,
  mapLanguageCodeLabel,
  type MapLocaleLoader,
  type MapTranslateFunction,
  nextMapLanguageInList,
  registerLanguageControlPacks,
  resolveInitialMapLanguage,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { textButtonState } from '@hungpvq/map-core/toolbar';
import { computed, onMounted, watch } from 'vue';

import { defineProps, withDefaults } from 'vue';
import { useLang } from '../../extra/lang/hook';
import { useMapControl } from '../../extra/registry/useMapControl';
import { defaultMapProps, useMap } from '../../hooks/useMap';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';

const props = withDefaults(
  defineProps<
    WithMapPropType & {
      languages?: MapLanguageCode[];
      locales?: Record<string, MapLangLocale>;
      labels?: Record<string, string>;
      defaultLanguage?: MapLanguageCode;
      fallbackLanguage?: MapLanguageCode;
      localeLoader?: MapLocaleLoader;
      reloadOnSelect?: boolean;
      /** Plug in vue-i18n / custom i18n; `null` clears. Catalog is passed as `fallback`. */
      translate?: MapTranslateFunction | null;
    }
  >(),
  {
    ...defaultMapProps,
    languages: () => [...MAP_BUILTIN_LANGUAGES],
    defaultLanguage: 'vi',
    reloadOnSelect: false,
  },
);

const { mapId, order } = useMap(props);
const {
  trans,
  language,
  registerLocale,
  registerLanguage,
  setLanguage,
  setFallbackLanguage,
  setTranslate,
  loadLocale,
  whenLocaleIdle,
} = useLang(mapId.value);

const languageList = computed(() =>
  (props.languages?.length ? props.languages : [...MAP_BUILTIN_LANGUAGES]).map(
    String,
  ),
);

/** Tooltip / a11y title. */
function titleFor(code: MapLanguageCode): string {
  const fromProp = props.labels?.[code];
  if (fromProp) return fromProp;
  const key = `map.language-control.${code}`;
  const translated = trans.value(key);
  if (translated !== key) return translated;
  return mapLanguageCodeLabel(code);
}

function registerStaticPacks() {
  registerLanguageControlPacks({
    registerLocale,
    registerLanguage,
    locales: props.locales,
    labels: props.labels,
    languages: languageList.value,
    resolveLabel: titleFor,
  });
}

let applySeq = 0;

async function applyLanguage(code: MapLanguageCode) {
  if (language.value === code) return;
  const seq = ++applySeq;
  if (props.localeLoader) {
    try {
      await loadLocale(code, props.localeLoader, {
        force: props.reloadOnSelect,
      });
    } catch {
      /* keep switching even if loader fails */
    }
  }
  if (seq !== applySeq) return;
  setLanguage(code);
}

function toggleLanguage() {
  const next = nextMapLanguageInList(languageList.value, language.value);
  if (next) void applyLanguage(next);
}

registerStaticPacks();
if (props.fallbackLanguage) {
  setFallbackLanguage(props.fallbackLanguage);
}

watch(
  () => props.translate,
  (fn) => {
    setTranslate(fn ?? null);
  },
  { immediate: true },
);

const languageButtons = [...MAP_BUILTIN_LANGUAGES].map((code) => ({
  id: code,
  getState: () =>
    textButtonState(mapLanguageCodeLabel(code), {
      visible: languageList.value.includes(code),
      active: language.value === code,
      title: titleFor(code),
    }),
  onClick: () => void applyLanguage(code),
}));

const expandableChrome = computed(() => ({
  kind: 'module-expandable' as const,
  moduleId: 'mapLanguageControl',
  orientation: 'row' as const,
  order: order.value,
  expandableButton: ({ active }: { active: boolean }) =>
    textButtonState(mapLanguageCodeLabel(language.value), {
      active,
      title: `${trans.value('map.language-control.title')}: ${titleFor(language.value)}`,
    }),
  buttons: languageButtons,
}));

const { moduleContainerProps, control } = useMapControl(mapId, {
  id: 'mapLanguageControl',
  panelKind: 'button',
  from: props,
  order,
  host: { button: expandableChrome },
  actions: () => [
    {
      type: 'mapLanguageControl',
      run: () => toggleLanguage(),
    },
    ...languageList.value.map((code) => ({
      type: `mapLanguageControl:${code}`,
      run: () => void applyLanguage(code),
    })),
  ],
  toolbar: expandableChrome,
});

watch(language, () => control.sync());
watch(languageList, () => control.sync());

onMounted(() => {
  void (async () => {
    await whenLocaleIdle();
    const initial = resolveInitialMapLanguage(
      languageList.value,
      props.defaultLanguage ?? 'vi',
    );
    if (props.localeLoader) {
      try {
        await loadLocale(initial, props.localeLoader);
      } catch {
        /* ignore */
      }
    }
    setLanguage(initial);
  })();
});
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <slot />
  </ModuleContainer>
</template>
