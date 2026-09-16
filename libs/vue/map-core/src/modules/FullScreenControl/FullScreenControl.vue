<script setup lang="ts">
import {
  MAP_ACTION_LOCALE,
  isDocumentFullscreen,
  resolveMapFullscreenTarget,
  subscribeFullscreenChange,
  toggleElementFullscreen,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';

import { mdiFullscreen, mdiFullscreenExit } from '@mdi/js';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import MapCommonButton from '../../components/MapCommonButton.vue';
import { useLang } from '../../extra/lang/hook';
import { useRegisterMapControl } from '../../extra/registry/useRegisterMapControl';
import { useToolbarControl } from '../../extra/toolbar/helper';
import { defaultMapProps, useMap } from '../../hooks/useMap';
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
const { trans, registerLocale } = useLang(mapId.value);
registerLocale('en', MAP_ACTION_LOCALE);

const isFullscreen = ref(false);
let stopFullscreen: (() => void) | undefined;

function resolveTarget(): HTMLElement | null {
  if (props.type === 'body') {
    return document.body;
  }
  let el: HTMLElement | undefined;
  callMap((map) => {
    el = resolveMapFullscreenTarget(map.getContainer()) ?? undefined;
  });
  return el ?? null;
}

async function toggle() {
  await toggleElementFullscreen(resolveTarget());
  isFullscreen.value = isDocumentFullscreen();
}

onMounted(() => {
  isFullscreen.value = isDocumentFullscreen();
  stopFullscreen = subscribeFullscreenChange(() => {
    isFullscreen.value = isDocumentFullscreen();
  });
});
onUnmounted(() => {
  stopFullscreen?.();
  stopFullscreen = undefined;
});

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
    return mdiButtonState(active ? path.exitFullscreen : path.fullscreen, {
      visible: true,
      active,
      order: order.value,
      title: active
        ? trans.value('map.action.fullscreen-control-exit')
        : trans.value('map.action.fullscreen-control-enter'),
    });
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
