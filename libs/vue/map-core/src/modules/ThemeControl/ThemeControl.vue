<script setup lang="ts">
import { type WithMapPropType, subscribeMapReady } from '@hungpvq/map-core';
import {
  MAP_THEME_COLOR_SCHEME,
  MAP_THEME_MODES,
  applyMapTheme,
  getMapThemeLocaleKey,
  getPrefersDark,
  getStoredMapThemeMode,
  normalizeMapThemeModes,
  resolveMapTheme,
  setStoredMapThemeMode,
  subscribePrefersContrastMore,
  toggleMapThemeLightDark,
  type MapThemeMode,
  type MapThemeScope,
} from '@hungpvq/map-core/theme';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import {
  mdiCircleHalfFull,
  mdiPalette,
  mdiPineTree,
  mdiThemeLightDark,
  mdiWater,
  mdiWeatherNight,
  mdiWeatherSunny,
  mdiWeatherSunset,
} from '@mdi/js';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import MapCommonButton from '../../components/MapCommonButton.vue';
import MapControlGroupButton from '../../components/MapControlGroupButton.vue';
import { useLang } from '../../extra/lang/hook';
import { useRegisterMapControl } from '../../extra/registry/useRegisterMapControl';
import { useToolbarControl } from '../../extra/toolbar/helper';
import { defaultMapProps, useMap } from '../../hooks/useMap';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';

const MODE_ICONS: Record<MapThemeMode, string> = {
  auto: mdiThemeLightDark,
  light: mdiWeatherSunny,
  dark: mdiWeatherNight,
  vibrant: mdiPalette,
  ocean: mdiWater,
  forest: mdiPineTree,
  sunset: mdiWeatherSunset,
  slate: mdiCircleHalfFull,
};

const props = withDefaults(
  defineProps<
    WithMapPropType & {
      themes?: MapThemeMode[];
      /**
       * `document` (default): `html` + mirror on this map shell (page-wide chrome).
       * `map`: only `.map-container[data-map-id]` + per-map localStorage.
       */
      scope?: MapThemeScope;
    }
  >(),
  {
    ...defaultMapProps,
    themes: () => [...MAP_THEME_MODES],
    scope: 'document',
  },
);

const { mapId, moduleContainerProps, order } = useMap(props);
const { trans } = useLang(mapId.value);
const storageOpts = computed(() =>
  props.scope === 'map' ? { mapId: mapId.value } : undefined,
);

const mode = ref<MapThemeMode>(
  getStoredMapThemeMode('auto', storageOpts.value),
);
const prefersDark = ref(getPrefersDark());

const themeModes = computed(() => normalizeMapThemeModes(props.themes));

const resolved = computed(() =>
  resolveMapTheme(mode.value, prefersDark.value),
);

const toggleTarget = computed(() => toggleMapThemeLightDark(resolved.value));

const toggleIcon = computed(() =>
  MAP_THEME_COLOR_SCHEME[resolved.value] === 'dark'
    ? mdiWeatherSunny
    : mdiWeatherNight,
);

function applyCurrentTheme() {
  applyMapTheme(resolveMapTheme(mode.value, prefersDark.value), {
    scope: props.scope,
    mapId: mapId.value,
  });
}

function setMode(next: MapThemeMode) {
  mode.value = next;
  setStoredMapThemeMode(next, storageOpts.value);
  applyCurrentTheme();
}

function toggleTheme() {
  setMode(toggleTarget.value);
}

const titleKey = computed(() => getMapThemeLocaleKey(toggleTarget.value));

useRegisterMapControl(mapId, {
  id: 'mapThemeControl',
  panelKind: 'button',
  buttonPosition: () => props.position,
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
    themes: themeModes.value,
    scope: props.scope,
  }),
  actions: [
    {
      type: 'mapThemeControl',
      run: () => toggleTheme(),
    },
  ],
});

const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapThemeControl',
  getState() {
    return mdiButtonState(toggleIcon.value, {
      visible: true,
      order: order.value,
      title: trans.value(titleKey.value),
    });
  },
  onClick() {
    toggleTheme();
  },
});

watch(mode, () => control.sync());
watch(prefersDark, () => {
  if (mode.value === 'auto') {
    applyCurrentTheme();
    control.sync();
  }
});
watch(toggleIcon, () => control.sync());
watch(
  () => [props.scope, mapId.value] as const,
  () => {
    mode.value = getStoredMapThemeMode('auto', storageOpts.value);
    applyCurrentTheme();
  },
);

let mediaQuery: MediaQueryList | undefined;
let unsubContrast: (() => void) | undefined;
let unsubReady: (() => void) | undefined;
function onMediaChange(event: MediaQueryListEvent) {
  prefersDark.value = event.matches;
}

onMounted(() => {
  applyCurrentTheme();
  if (props.scope === 'map') {
    unsubReady = subscribeMapReady(mapId.value, () => {
      applyCurrentTheme();
    });
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDark.value = mediaQuery.matches;
    mediaQuery.addEventListener('change', onMediaChange);
  }
  unsubContrast = subscribePrefersContrastMore(() => {
    applyCurrentTheme();
  });
});

onUnmounted(() => {
  if (mediaQuery) mediaQuery.removeEventListener('change', onMediaChange);
  unsubContrast?.();
  unsubReady?.();
});
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlGroupButton
        row
        class="button-group-hover-expand"
      >
        <MapCommonButton
          v-if="state"
          :option="state"
          @click.stop="control.onAction"
        />
        <MapCommonButton
          v-for="themeId in themeModes"
          :key="themeId"
          :option="
            mdiButtonState(MODE_ICONS[themeId], {
              visible: true,
              active: mode === themeId,
              title: trans(getMapThemeLocaleKey(themeId)),
            })
          "
          @click.stop="setMode(themeId)"
        />
      </MapControlGroupButton>
    </template>
    <slot />
  </ModuleContainer>
</template>
