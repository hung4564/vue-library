<script setup lang="ts">
import { useFullscreen } from '@hungpvq/shared-core';

import { mdiFullscreen, mdiFullscreenExit } from '@mdi/js';
import { watch } from 'vue';
import MapCommonButton from '../../components/MapCommonButton.vue';
import { useLang, useToolbarControl } from '../../extra';
import { defaultMapProps, useMap, type WithMapPropType } from '../../hooks';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';
const path = {
  fullscreen: mdiFullscreen,
  exitFullscreen: mdiFullscreenExit,
};
const props = withDefaults(defineProps<WithMapPropType & { type?: string }>(), {
  ...defaultMapProps,
  type: 'body',
});
const { callMap, mapId, moduleContainerProps } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault({
  map: {
    action: {
      'fullscreen-control-enter': 'Enter fullscreen',
      'fullscreen-control-exit': 'Exit fullscreen',
    },
  },
});
const { isFullscreen, enter, exit, toggle } = useFullscreen(
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
const { state, control } = useToolbarControl(mapId.value, props.controlLayout, {
  id: 'mapFullscreen',
  getState() {
    const active = isFullscreen.value;
    return {
      visible: true,
      active,
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
      <MapCommonButton v-if="state" :option="state" @click="control.onAction">
      </MapCommonButton>
    </template>
    <slot />
  </ModuleContainer>
</template>
