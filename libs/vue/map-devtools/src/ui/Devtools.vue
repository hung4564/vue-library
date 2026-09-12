<template>
  <DevtoolsControl v-if="mode === 'control'" v-bind="controlBind" />
  <DevtoolsOverlay v-else :container-id="containerId" />
</template>

<script setup lang="ts">
import type { WithMapPropType } from '@hungpvq/map-core';
import { computed } from 'vue';
import type { DevtoolsMode } from '../control';
import type { WithShowProps } from '@hungpvq/vue-map-core';
import DevtoolsControl from './DevtoolsControl.vue';
import DevtoolsOverlay from './DevtoolsOverlay.vue';

const props = withDefaults(
  defineProps<
    {
      /** Map `DraggableContainer` id (overlay mobile bottom sheet). */
      containerId?: string;
      /**
       * `overlay` (default): fixed FAB + panel (mount anywhere).
       * `control`: map corner button + popup (mount inside `<Map>`).
       */
      mode?: DevtoolsMode;
    } & Partial<WithMapPropType & WithShowProps>
  >(),
  {
    mode: 'overlay',
  },
);

const mode = computed(() => props.mode ?? 'overlay');

const controlBind = computed(() => ({
  mapId: props.mapId,
  dragId: props.dragId,
  position: props.position,
  controlLayout: props.controlLayout,
  controlVisible: props.controlVisible,
  controlOrder: props.controlOrder,
  btnWidth: props.btnWidth,
  show: props.show,
}));
</script>
