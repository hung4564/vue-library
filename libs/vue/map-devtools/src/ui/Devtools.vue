<template>
  <DevtoolsControl v-bind="controlBind" />
</template>

<script setup lang="ts">
import type { WithMapPropType } from '@hungpvq/map-core';
import type { WithShowProps } from '@hungpvq/vue-map-core';
import { computed } from 'vue';
import DevtoolsControl from './DevtoolsControl.vue';

/**
 * Map Devtools panel — mount **inside** `<Map>` (uses `DraggableItemPopup`).
 */
const props = withDefaults(
  defineProps<Partial<WithMapPropType & WithShowProps>>(),
  {
    show: false,
    position: 'bottom-right',
  },
);

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
