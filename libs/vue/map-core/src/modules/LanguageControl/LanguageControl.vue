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

import MapCommonButton from '../../components/MapCommonButton.vue';
import MapControlGroupButton from '../../components/MapControlGroupButton.vue';
import { useLang } from '../../extra/lang/hook';
import { useRegisterMapControl } from '../../extra/registry/useRegisterMapControl';
import { useToolbarControl } from '../../extra/toolbar/helper';
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

const { mapId, moduleContainerProps, order } = useMap(props);
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

useRegisterMapControl(mapId, {
  id: 'mapLanguageControl',
  panelKind: 'button',
  buttonPosition: () => props.position,
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
    languages: languageList.value,
    defaultLanguage: props.defaultLanguage,
    fallbackLanguage: props.fallbackLanguage,
  }),
  actions: [
    {
      type: 'mapLanguageControl',
      run: () => toggleLanguage(),
    },
  ],
});

const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapLanguageControl',
  getState() {
    return textButtonState(mapLanguageCodeLabel(language.value), {
      visible: true,
      active: true,
      order: order.value,
      title: `${trans.value('map.language-control.title')}: ${titleFor(language.value)}`,
    });
  },
  onClick() {
    toggleLanguage();
  },
});

watch(language, () => control.sync());

onMounted(() => {
  void (async () => {
    // Wait for package/control registerLocale waves to flush (one emit).
    await whenLocaleIdle();
    const initial = resolveInitialMapLanguage(
      languageList.value,
      props.defaultLanguage ?? 'vi',
    );
    // Load overlays (e.g. demo-i18n) before activating language so UI sees merges.
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
    <template #btn>
      <!--
        DOM: <current> first (collapsed face; RTL right corners keep it outer),
        then all language chips. Visual expand ≈ fr | vi | en | <current>.
        Click chip → select; click current → cycle.
      -->
      <MapControlGroupButton row class="button-group-hover-expand">
        <MapCommonButton
          v-if="state"
          :option="state"
          @click.stop="control.onAction"
        />
        <MapCommonButton
          v-for="code in languageList"
          :key="code"
          :option="
            textButtonState(mapLanguageCodeLabel(code), {
              visible: true,
              active: language === code,
              title: titleFor(code),
            })
          "
          @click.stop="applyLanguage(code)"
        />
      </MapControlGroupButton>
    </template>
    <slot />
  </ModuleContainer>
</template>
