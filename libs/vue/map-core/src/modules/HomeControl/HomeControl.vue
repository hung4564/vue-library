<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import {
  captureHomeView,
  goHome,
  type HomeView,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { mdiHome } from '@mdi/js';
import { ref } from 'vue';

import { useLang } from '../../extra/lang/hook';
import { useMapControl } from '../../extra/registry/useMapControl';
import { defaultMapProps, useMap } from '../../hooks/useMap';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';
const props = withDefaults(
  defineProps<
    WithMapPropType & {
      zoom?: number;
      center?: Array<number>;
    }
  >(),
  {
    ...defaultMapProps,
  },
);
const homeView = ref<HomeView>({
  zoom: props.zoom || 0,
  center: { lat: 0, lng: 0 },
});

const { callMap, mapId, order } = useMap(props, onInit);
const { trans } = useLang(mapId.value);
function onGoHome() {
  callMap((map) => {
    goHome(map, homeView.value);
  });
}
function onInit(_map: MapSimple) {
  homeView.value = captureHomeView(_map, {
    zoom: props.zoom,
    center: props.center,
  });
}
const { moduleContainerProps } = useMapControl(mapId, {
  id: 'mapHomeControl',
  panelKind: 'button',
  from: props,
  order,
  actions: [
    {
      type: 'mapHomeControl',
      run: () => {
        onGoHome();
      },
    },
  ],
  getButtonState() {
    return mdiButtonState(mdiHome, {
      visible: true,
      title: trans.value('map.home.title'),
      order: order.value,
    });
  },
  onClick() {
    onGoHome();
  },
});
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <slot />
  </ModuleContainer>
</template>
