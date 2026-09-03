<script setup lang="ts">
import { MAP_ACTION_LOCALE, type WithMapPropType } from '@hungpvq/map-core';
import { useFullscreen } from '@hungpvq/shared-core';

import { mdiFullscreen, mdiFullscreenExit } from '@mdi/js';
import { watch } from 'vue';
import MapCommonButton from '../../components/MapCommonButton.vue';
import { useLang, useRegisterMapControl, useToolbarControl } from '../../extra';
import { defaultMapProps, useMap } from '../../hooks';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';
const path = {
  fullscreen: mdiFullscreen,
  exitFullscreen: mdiFullscreenExit,
};
const props = withDefaults(defineProps<WithMapPropType & { type?: string }>(), {
  ...defaultMapProps,
  type: 'body',
});
const { callMap, mapId, moduleContainerProps, order } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault(MAP_ACTION_LOCALE);
const { isFullscreen, toggle } = useFullscreen(
  props.type == 'body' ? document.querySelector('body') : getMapContainer(),
);
function getMapContainer(el?: HTMLElement | null): HTMLElement {
  callMap((map) => {
    if (!el) {
      el = map.getContainer();
    }
    if (el.classList.contains('map-container') || el.tagName === 'BODY') {
      return el;
    } else {
      el = getMapContainer(el.parentElement);
    }
  });
  return el!;
}
useRegisterMapControl(mapId, {
  id: 'mapFullscreenControl',
  panelKind: 'button',
  buttonPosition: () => props.position,
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
  }),
  actions: [
    {
      type: 'mapFullscreenControl',
      run: () => {
        void toggle();
      },
    },
  ],
});
const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapFullscreenControl',
  getState() {
    const active = isFullscreen.value;
    return {
      visible: true,
      active,
      order: order.value,
      title: active
        ? trans.value('map.action.fullscreen-control-exit')
        : trans.value('map.action.fullscreen-control-enter'),
      icon: {
        type: 'mdi',
        path: active ? path.exitFullscreen : path.fullscreen,
      },
    };
  },

  async onClick() {
    await toggle();
  },
});
watch(isFullscreen, () => control.sync());
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
