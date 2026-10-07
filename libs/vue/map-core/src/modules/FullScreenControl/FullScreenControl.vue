<script setup lang="ts">
import {
  isDocumentFullscreen,
  resolveMapFullscreenTarget,
  subscribeFullscreenChange,
  toggleElementFullscreen,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { mdiFullscreen, mdiFullscreenExit } from '@mdi/js';
import { onMounted, onUnmounted, ref, watch } from 'vue';

import { defineProps, withDefaults } from 'vue';
import { useLang } from '../../extra/lang/hook';
import { useMapControl } from '../../extra/registry/useMapControl';
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
const { callMap, mapId, order } = useMap(props);
const { trans } = useLang(mapId.value);
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

const singleButton = {
  kind: 'single' as const,
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
};
const { moduleContainerProps, control } = useMapControl(mapId, {
  id: 'mapFullscreenControl',
  panelKind: 'button',
  from: props,
  order,
  actions: [
    {
      type: 'mapFullscreenControl',
      run: () => {
        void toggle();
      },
    },
  ],
  host: { button: singleButton },
  toolbar: singleButton,
});
watch(isFullscreen, () => control?.sync());
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <slot />
  </ModuleContainer>
</template>
