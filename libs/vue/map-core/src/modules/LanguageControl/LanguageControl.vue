<script setup lang="ts">
import {
  MAP_BUILTIN_LANGUAGES,
  MAP_CORE_LOCALE_EN,
  MAP_CORE_LOCALE_VI,
  deepMergeLocale,
  getStoredMapLanguage,
  type MapLangLocale,
  type MapLanguageCode,
  type MapLocaleLoader,
  type MapTranslateFunction,
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
} = useLang(mapId.value);

const languageList = computed(() =>
  (props.languages?.length ? props.languages : [...MAP_BUILTIN_LANGUAGES]).map(
    String,
  ),
);

/** Short chip text on the button (EN / VI / FR). */
function codeLabel(code: MapLanguageCode): string {
  return String(code).toUpperCase();
}

/** Tooltip / a11y title. */
function titleFor(code: MapLanguageCode): string {
  const fromProp = props.labels?.[code];
  if (fromProp) return fromProp;
  const key = `map.language-control.${code}`;
  const translated = trans.value(key);
  if (translated !== key) return translated;
  return codeLabel(code);
}

function resolveInitialLanguage(): MapLanguageCode {
  const fallback = props.defaultLanguage ?? 'vi';
  const stored = getStoredMapLanguage(fallback);
  return languageList.value.includes(stored) ? stored : fallback;
}

function registerStaticPacks() {
  registerLocale(
    'en',
    deepMergeLocale(MAP_CORE_LOCALE_EN, props.locales?.en ?? {}),
  );
  registerLocale(
    'vi',
    deepMergeLocale(MAP_CORE_LOCALE_VI, props.locales?.vi ?? {}),
  );
  for (const [code, tree] of Object.entries(props.locales ?? {})) {
    if (code === 'en' || code === 'vi') continue;
    registerLocale(code, tree);
  }
  for (const code of languageList.value) {
    registerLanguage(code, {
      label: props.labels?.[code] ?? titleFor(code),
    });
  }
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
  const list = languageList.value;
  if (!list.length) return;
  const idx = list.indexOf(language.value);
  const next = list[(idx + 1) % list.length]!;
  void applyLanguage(next);
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
    return textButtonState(codeLabel(language.value), {
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
  const initial = resolveInitialLanguage();
  setLanguage(initial);
  if (props.localeLoader) {
    void loadLocale(initial, props.localeLoader).catch(() => {
      /* ignore */
    });
  }
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
      <MapControlGroupButton
        row
        class="map-language-control-group button-group-hover-expand"
      >
        <MapCommonButton
          v-if="state"
          :option="state"
          @click.stop="control.onAction"
        />
        <MapCommonButton
          v-for="code in languageList"
          :key="code"
          :option="
            textButtonState(codeLabel(code), {
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
