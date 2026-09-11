<template>
  <div class="module__container">
    <Teleport
      v-if="controlVisible && hasCornerChrome && isStandaloneButton"
      :to="btnTo"
    >
      <div
        v-if="hasSlotBtn"
        :class="btnModuleClass"
        :style="{ order: controlOrder }"
      >
        <slot name="btn" />
      </div>
      <slot name="btnOutside" />
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
import { MAP_MODULE_CONTROL_ID_KEY } from '@hungpvq/map-core';
import { computed, inject, useSlots } from 'vue';
const slots = useSlots();
const props = defineProps({
  mapId: { type: String, default: '' },
  dragId: { type: String, default: '' },
  btnWidth: { type: Number, default: 40 },
  controlOrder: { type: Number, default: 0 },
  controlId: { type: String, default: '' },
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
  controlLayout: {
    type: String,
    default: 'standalone',
    validator(value: string) {
      return (
        ['toolbar', 'standalone', 'button', 'menu'].indexOf(value) !== -1
      );
    },
  },
});
const hasSlotBtn = computed(() => !!slots['btn']);
const hasSlotBtnOutside = computed(() => !!slots['btnOutside']);
const hasCornerChrome = computed(
  () => hasSlotBtn.value || hasSlotBtnOutside.value,
);
const isStandaloneButton = computed(
  () => props.controlLayout !== 'toolbar' && props.controlLayout !== 'menu',
);
const hasSlotDraggable = computed(() => !!slots['draggable']);
const i_dragId = inject<string>('$map.dragId');
const i_map_id = inject<string>('$map.id');
const injectedControlId = inject<string | undefined>(
  MAP_MODULE_CONTROL_ID_KEY,
  undefined,
);
const resolvedControlId = computed(
  () => props.controlId || injectedControlId || '',
);
const btnModuleClass = computed(() => {
  const id = resolvedControlId.value;
  return id
    ? ['btn-module-container', 'map-common-button', `${id}-btn-module-container`]
    : ['btn-module-container', 'map-common-button'];
});
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

interface BindPosition {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  containerId: string;
}
const bindDrag = computed(() => {
  const result: BindPosition = {
    containerId: c_containerId.value,
  };

  const configs = [
    { key: 'left', fallback: 18 + props.btnWidth },
    { key: 'right', fallback: 18 + props.btnWidth },
    { key: 'top', fallback: 10 },
    { key: 'bottom', fallback: 10 },
  ] as const;

  configs.forEach(({ key, fallback }) => {
    if (props.position.includes(key)) {
      result[key] = fallback;
    }
  });

  return result;
});
</script>
