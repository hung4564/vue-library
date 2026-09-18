<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import {
  captureHomeView,
  goHome,
  HOME_CONTROL_LOCALE,
  type HomeView,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { mdiHome } from '@mdi/js';
import { ref } from 'vue';
import MapCommonButton from '../../components/MapCommonButton.vue';
import { useLang } from '../../extra/lang/hook';
import { useRegisterMapControl } from '../../extra/registry/useRegisterMapControl';
import { useToolbarControl } from '../../extra/toolbar/helper';
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

const { callMap, mapId, moduleContainerProps, order } = useMap(props, onInit);
const { trans, registerLocale } = useLang(mapId.value);
registerLocale('en', HOME_CONTROL_LOCALE);
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
useRegisterMapControl(mapId, {
  id: 'mapHomeControl',
  panelKind: 'button',
  buttonPosition: () => props.position,
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
  }),
  actions: [
    {
      type: 'mapHomeControl',
      run: () => {
        onGoHome();
      },
    },
  ],
});
const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapHomeControl',
  getState() {
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
    <template #btn>
      <MapCommonButton
        v-if="state"
        :option="state"
        @click.stop="control.onAction"
      >
      </MapCommonButton>
    </template>
    <slot />
  </ModuleContainer>
</template>
