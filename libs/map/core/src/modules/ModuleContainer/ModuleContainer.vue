<template>
  <div class="module__container">
    <Teleport v-if="controlVisible && hasSlotBtn" :to="btnTo">
      <slot name="btn" />
    </Teleport>
    <slot />
    <Teleport :to="draggableTo" v-if="c_containerId && hasSlotDraggable">
      <slot v-bind="bindDrag" name="draggable" />
    </Teleport>
  </div>
</template>
<script lang="ts">
export default {
  name: 'ModuleContainer',
};
</script>
<script setup lang="ts">
import { computed, inject, useSlots } from 'vue';
const slots = useSlots();
const props = defineProps({
  mapId: { type: String, default: '' },
  dragId: { type: String, default: '' },
  btnWidth: { type: Number, default: 40 },
  position: {
    type: String,
    default: 'bottom-right',
    validator(value: string) {
      return (
        ['top-left', 'top-right', 'bottom-left', 'bottom-right'].indexOf(
          value,
        ) !== -1
      );
    },
  },
  controlVisible: {
    type: Boolean,
    default: true,
  },
  top: Number,
  bottom: Number,
  left: Number,
  right: Number,
});
const hasSlotBtn = computed(() => !!slots['btn']);
const hasSlotDraggable = computed(() => !!slots['draggable']);
const i_dragId = inject<string>('$map.dragId');
const i_map_id = inject<string>('$map.id');
const c_containerId = computed<string>(() => {
  return props.dragId || i_dragId!;
});
const c_mapId = computed<string>(() => {
  return props.mapId || i_map_id!;
});

const draggableTo = computed(() => {
  return `#map-draggable-${c_mapId.value}`;
});
const btnTo = computed(() => {
  return `#${props.position}-${c_mapId.value}`;
});
function resolvePosition(
  value: number | undefined,
  direction: string,
  fallback: number,
  position: string,
): number | undefined {
  if (value != null) return value;
  if (position.includes(direction)) return fallback;
  return undefined;
}
interface BindPosition {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  containerId: string;
}
const bindDrag = computed(() => {
  const left = resolvePosition(
    props.left,
    'left',
    18 + props.btnWidth,
    props.position,
  );
  const right = resolvePosition(
    props.right,
    'right',
    18 + props.btnWidth,
    props.position,
  );
  const top = resolvePosition(props.top, 'top', 10, props.position);
  const bottom = resolvePosition(props.bottom, 'bottom', 10, props.position);

  const bind: BindPosition = {
    containerId: c_containerId.value,
    ...(left !== undefined && { left }),
    ...(right !== undefined && { right }),
    ...(top !== undefined && { top }),
    ...(bottom !== undefined && { bottom }),
  };

  return bind;
});
</script>

<style scoped>
.module__container {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}
</style>
<style>
.module__container > *:not(.module__container) {
  pointer-events: all;
}
</style>
