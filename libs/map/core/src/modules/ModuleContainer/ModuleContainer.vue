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
<script>
export default {
  name: 'ModuleContainer',
};
</script>
<script setup>
import { computed, inject, useSlots } from 'vue';
const slots = useSlots();
const props = defineProps({
  mapId: { type: String, default: '' },
  dragId: { type: String, default: '' },
  btnWidth: { type: Number, default: 40 },
  position: {
    type: String,
    default: 'bottom-right',
    validator(value) {
      return (
        ['top-left', 'top-right', 'bottom-left', 'bottom-right'].indexOf(
          value
        ) !== -1
      );
    },
  },
  controlVisible: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
});
const hasSlotBtn = computed(() => !!slots['btn']);
const hasSlotDraggable = computed(() => !!slots['draggable']);
const i_dragId = inject('$map.dragId');
const i_map_id = inject('$map.id');
const c_containerId = computed(() => {
  return props.dragId || i_dragId;
});
const c_mapId = computed(() => {
  return props.mapId || i_map_id;
});

const draggableTo = computed(() => {
  return `#map-draggable-${c_mapId.value}`;
});
const btnTo = computed(() => {
  return `#${props.position}-${c_mapId.value}`;
});
const bindDrag = computed(() => {
  let bind = {};
  if (props.position.includes('left')) {
    bind.left = 18 + props.btnWidth;
  }
  if (props.position.includes('right')) {
    bind.right = 18 + props.btnWidth;
  }
  if (props.position.includes('top')) {
    bind.top = 10;
  }
  if (props.position.includes('bottom')) {
    bind.bottom = 10;
  }
  bind.containerId = c_containerId.value;
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
