<script setup lang="ts">
import { type WithMapPropType } from '@hungpvq/map-core';
import {
  MAP_THEME_COLOR_SCHEME,
  MAP_THEME_MODES,
  THEME_CONTROL_LOCALE,
  applyMapThemeClass,
  getMapThemeLocaleKey,
  getPrefersDark,
  getStoredMapThemeMode,
  normalizeMapThemeModes,
  resolveMapTheme,
  setStoredMapThemeMode,
  toggleMapThemeLightDark,
  type MapThemeMode,
} from '@hungpvq/map-core/theme';
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
import { useLang, useRegisterMapControl, useToolbarControl } from '../../extra';
import { defaultMapProps, useMap } from '../../hooks';
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
    }
  >(),
  {
    ...defaultMapProps,
    themes: () => [...MAP_THEME_MODES],
  },
);

const { mapId, moduleContainerProps, order } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault(THEME_CONTROL_LOCALE);

const mode = ref<MapThemeMode>(getStoredMapThemeMode('auto'));
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
  applyMapThemeClass(resolveMapTheme(mode.value, prefersDark.value));
}

function setMode(next: MapThemeMode) {
  mode.value = next;
  setStoredMapThemeMode(next);
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
    return {
      visible: true,
      order: order.value,
      title: trans.value(titleKey.value),
      icon: {
        type: 'mdi',
        path: toggleIcon.value,
      },
    };
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

let mediaQuery: MediaQueryList | undefined;
function onMediaChange(event: MediaQueryListEvent) {
  prefersDark.value = event.matches;
}

onMounted(() => {
  applyCurrentTheme();
  if (typeof window !== 'undefined' && window.matchMedia) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDark.value = mediaQuery.matches;
    if ('addEventListener' in mediaQuery) {
      mediaQuery.addEventListener('change', onMediaChange);
    } else {
      // @ts-expect-error deprecated API
      mediaQuery.addListener(onMediaChange);
    }
  }
});

onUnmounted(() => {
  if (!mediaQuery) return;
  if ('removeEventListener' in mediaQuery) {
    mediaQuery.removeEventListener('change', onMediaChange);
  } else {
    // @ts-expect-error deprecated API
    mediaQuery.removeListener(onMediaChange);
  }
});
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlGroupButton
        row
        class="map-theme-control-group button-group-hover-expand"
      >
        <MapCommonButton
          v-if="state"
          :option="state"
          @click.stop="control.onAction"
        />
        <MapCommonButton
          v-for="themeId in themeModes"
          :key="themeId"
          :option="{
            visible: true,
            active: mode === themeId,
            title: trans(getMapThemeLocaleKey(themeId)),
            icon: { type: 'mdi', path: MODE_ICONS[themeId] },
          }"
          @click.stop="setMode(themeId)"
        />
      </MapControlGroupButton>
    </template>
    <slot />
  </ModuleContainer>
</template>
