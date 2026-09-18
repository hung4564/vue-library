<script setup lang="ts">
import type { MapSimple, WithMapPropType } from '@hungpvq/map-core';
import {
  attachGlobeProjectionListener,
  GLOBE_CONTROL_LOCALE,
  isGlobeProjection,
  toggleGlobeProjection,
} from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { mdiWeb } from '@mdi/js';
import { ref } from 'vue';
import MapCommonButton from '../../components/MapCommonButton.vue';
import { useLang } from '../../extra/lang/hook';
import { useRegisterMapControl } from '../../extra/registry/useRegisterMapControl';
import { useToolbarControl } from '../../extra/toolbar/helper';
import { defaultMapProps, useMap } from '../../hooks/useMap';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';
const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});
const currentProjection = ref<string | undefined>('mercator');

const { callMap, mapId, moduleContainerProps, order } = useMap(
  props,
  onInit,
  onDestroy,
);
const { trans, registerLocale } = useLang(mapId.value);
registerLocale('en', GLOBE_CONTROL_LOCALE);
function toggle() {
  callMap((map) => {
    currentProjection.value = toggleGlobeProjection(
      map,
      currentProjection.value,
    );
  });
}
let detachProjection: (() => void) | undefined;
function onInit(_map: MapSimple) {
  detachProjection = attachGlobeProjectionListener(_map, (type) => {
    currentProjection.value = type;
  });
}
function onDestroy(_map: MapSimple) {
  detachProjection?.();
  detachProjection = undefined;
}
useRegisterMapControl(mapId, {
  id: 'mapGlobeControl',
  panelKind: 'button',
  buttonPosition: () => props.position,
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
  }),
  actions: [
    {
      type: 'mapGlobeControl',
      run: () => {
        toggle();
      },
    },
  ],
});
const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapGlobeControl',
  getState() {
    return mdiButtonState(mdiWeb, {
      visible: true,
      active: isGlobeProjection(currentProjection.value),
      title: trans.value('map.global-control.title'),
      order: order.value,
    });
  },
  onClick() {
    toggle();
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
