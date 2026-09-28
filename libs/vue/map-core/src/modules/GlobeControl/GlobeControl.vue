<script setup lang="ts">
import type { MapSimple, WithMapPropType } from '@hungpvq/map-core';
import {
  attachGlobeProjectionListener,
  isGlobeProjection,
  toggleGlobeProjection,
} from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { mdiWeb } from '@mdi/js';
import { ref } from 'vue';

import { useLang } from '../../extra/lang/hook';
import { useMapControl } from '../../extra/registry/useMapControl';
import { defaultMapProps, useMap } from '../../hooks/useMap';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';
const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});
const currentProjection = ref<string | undefined>('mercator');

const { callMap, mapId, order } = useMap(props, onInit, onDestroy);
const { trans } = useLang(mapId.value);
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
const { moduleContainerProps } = useMapControl(mapId, {
  id: 'mapGlobeControl',
  panelKind: 'button',
  from: props,
  order,
  actions: [
    {
      type: 'mapGlobeControl',
      run: () => {
        toggle();
      },
    },
  ],
  getButtonState() {
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
    <slot />
  </ModuleContainer>
</template>
