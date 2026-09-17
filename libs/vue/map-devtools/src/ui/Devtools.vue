<template>
  <DevtoolsControl v-if="mode === 'control'" v-bind="controlBind" />
  <DevtoolsOverlay v-else :container-id="containerId" :map-id="mapId" />
</template>

<script setup lang="ts">
import type { DevtoolsMode, WithMapPropType } from '@hungpvq/map-core';
import type { WithShowProps } from '@hungpvq/vue-map-core';
import { computed } from 'vue';
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
const containerId = computed(() => props.containerId);
const mapId = computed(() => props.mapId);

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

<style>
@import '../style.css';
</style>
