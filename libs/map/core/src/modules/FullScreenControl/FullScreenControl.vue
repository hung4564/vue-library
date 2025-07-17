<script setup lang="ts">
import { useFullscreen } from '@hungpvq/shared-core';

import SvgIcon from '@jamescoyle/vue-icon';
import { mdiFullscreen, mdiFullscreenExit } from '@mdi/js';
import MapControlButton from '../../components/MapControlButton.vue';
import { useLang } from '../../extra';
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
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlButton
        icon
        :title="
          !isFullscreen
            ? trans('map.action.fullscreen-control-enter')
            : trans('map.action.fullscreen-control-exit')
        "
        @click="toggle()"
      >
        <SvgIcon
          :size="18"
          type="mdi"
          :path="isFullscreen ? path.exitFullscreen : path.fullscreen"
        />
      </MapControlButton>
    </template>
    <slot />
  </ModuleContainer>
</template>
