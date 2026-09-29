<script setup lang="ts">
import { subscribeMapReady, type WithMapPropType } from '@hungpvq/map-core';
import {
  applyMapTheme,
  getMapThemeLocaleKey,
  getPrefersDark,
  getStoredMapThemeMode,
  MAP_THEME_COLOR_SCHEME,
  MAP_THEME_MODES,
  type MapThemeMode,
  type MapThemeScope,
  normalizeMapThemeModes,
  resolveMapTheme,
  setStoredMapThemeMode,
  subscribePrefersContrastMore,
  toggleMapThemeLightDark,
} from '@hungpvq/map-core/theme';
import {
  type MapControlButtonUIState,
  mdiButtonState,
} from '@hungpvq/map-core/toolbar';
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
import { useMapControl } from '../../extra/registry/useMapControl';
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

const { mapId, order } = useMap(props);
const { trans } = useLang(mapId.value);
const storageOpts = computed(() =>
  props.scope === 'map' ? { mapId: mapId.value } : undefined,
);

const mode = ref<MapThemeMode>(
  getStoredMapThemeMode('auto', storageOpts.value),
);
const prefersDark = ref(getPrefersDark());
const groupExpanded = ref(false);

const themeModes = computed(() => normalizeMapThemeModes(props.themes));

const resolved = computed(() => resolveMapTheme(mode.value, prefersDark.value));

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
  groupExpanded.value = false;
}

function toggleTheme() {
  setMode(toggleTarget.value);
}

const titleKey = computed(() => getMapThemeLocaleKey(toggleTarget.value));

const {
  moduleContainerProps,
  state: moduleState,
  control,
} = useMapControl(mapId, {
  id: 'mapThemeControl',
  panelKind: 'button',
  from: props,
  order,
  buttonSlot: 'custom',
  getProps: () => ({
    themes: themeModes.value,
    scope: props.scope,
  }),
  actions: () => [
    {
      type: 'mapThemeControl',
      run: () => toggleTheme(),
    },
    ...themeModes.value.map((themeId) => ({
      type: `mapThemeControl:${themeId}`,
      run: () => setMode(themeId),
    })),
  ],
  toolbar: {
    kind: 'module-expandable',
    moduleId: 'mapThemeControl',
    expandableButton: ({ active }) => {
      return mdiButtonState(toggleIcon.value, {
        active,
        title: trans.value(titleKey.value),
      });
    },
    orientation: 'row',
    order: order.value,
    buttons: [...MAP_THEME_MODES].map((themeId) => ({
      id: themeId,
      getState: () =>
        mdiButtonState(MODE_ICONS[themeId], {
          visible: themeModes.value.includes(themeId),
          active: mode.value === themeId,
          title: trans.value(getMapThemeLocaleKey(themeId)),
        }),
      onClick: () => setMode(themeId),
    })),
  },
});

const launcherState = computed((): MapControlButtonUIState | undefined => {
  const s = moduleState.value as
    Record<string, MapControlButtonUIState> | undefined;
  return s?.launcher;
});

watch(mode, () => control.sync());
watch(prefersDark, () => {
  if (mode.value === 'auto') {
    applyCurrentTheme();
    control.sync();
  }
});
watch(toggleIcon, () => control.sync());
watch(themeModes, () => control.sync());
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
        class="button-group-click-expand"
        :class="{ 'is-expanded': groupExpanded }"
      >
        <MapCommonButton
          v-if="launcherState"
          :option="launcherState"
          @click.stop="groupExpanded = !groupExpanded"
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
