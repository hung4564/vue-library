<template>
  <div class="module__container">
    <Teleport
      v-if="controlVisible && hasCornerChrome && showCornerChrome"
      :to="btnTo"
    >
      <div
        v-if="hasBtnContent"
        :class="btnModuleClass"
        :style="{ order: controlOrder }"
        :data-map-control-id="resolvedControlId || undefined"
      >
        <slot
          v-if="hasSlotBtn"
          name="btn"
        />
        <MapAutoHostButtons
          v-else-if="autoButtonEntry && autoButtonState != null"
          :state="autoButtonState"
          :position="position"
          :on-action="onAutoAction"
        />
      </div>
      <slot name="btnOutside" />
    </Teleport>
    <slot />
    <Teleport
      :to="draggableTo"
      v-if="c_containerId && hasSlotDraggable"
    >
      <slot
        v-bind="bindDrag"
        name="draggable"
      />
    </Teleport>
  </div>
</template>
<script lang="ts">
export default {
  name: 'ModuleContainer',
};
</script>
<script setup lang="ts">
import {
  buildModuleBindPosition,
  getControlAutoButton,
  isModuleCornerChromeVisible,
  MAP_MODULE_CONTROL_ID_KEY,
  moduleBtnContainerClassName,
  moduleCornerHostSelector,
  moduleDraggableHostSelector,
  subscribeControlAutoButton,
} from '@hungpvq/map-core';
import { computed, inject, onUnmounted, ref, useSlots } from 'vue';

import { defineProps } from 'vue';
import MapAutoHostButtons from '../../components/MapAutoHostButtons.vue';

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
      return ['toolbar', 'standalone', 'button', 'menu'].indexOf(value) !== -1;
    },
  },
});
const hasSlotBtn = computed(() => !!slots['btn']);
const hasSlotBtnOutside = computed(() => !!slots['btnOutside']);
const autoBtnTick = ref(0);
const i_map_id = inject<string>('$map.id');
const injectedControlId = inject<string | undefined>(
  MAP_MODULE_CONTROL_ID_KEY,
  undefined,
);
const resolvedControlId = computed(
  () => props.controlId || injectedControlId || '',
);
const c_mapId = computed<string>(() => {
  return props.mapId || i_map_id!;
});

const autoButtonEntry = computed(() => {
  autoBtnTick.value;
  if (hasSlotBtn.value) return undefined;
  const mid = c_mapId.value;
  const cid = resolvedControlId.value;
  if (!mid || !cid) return undefined;
  return getControlAutoButton(mid, cid);
});

const autoButtonState = computed(() => {
  autoBtnTick.value;
  const entry = autoButtonEntry.value;
  if (!entry) return undefined;
  return entry.getUiState();
});

const hasAutoBtn = computed(
  () => !!autoButtonEntry.value && autoButtonState.value != null,
);
const hasBtnContent = computed(() => hasSlotBtn.value || hasAutoBtn.value);
const hasCornerChrome = computed(
  () => hasBtnContent.value || hasSlotBtnOutside.value,
);
const showCornerChrome = computed(() =>
  isModuleCornerChromeVisible(
    props.controlLayout as 'toolbar' | 'standalone' | 'button' | 'menu',
  ),
);
const hasSlotDraggable = computed(() => !!slots['draggable']);
const i_dragId = inject<string>('$map.dragId');
const btnModuleClass = computed(() =>
  moduleBtnContainerClassName(resolvedControlId.value),
);
const c_containerId = computed<string>(() => {
  return props.dragId || i_dragId!;
});

const stopAutoBtn = subscribeControlAutoButton((mid, controlId) => {
  if (
    mid === c_mapId.value &&
    (controlId === resolvedControlId.value || controlId === '*')
  ) {
    autoBtnTick.value++;
  }
});
onUnmounted(() => stopAutoBtn());

function onAutoAction(...args: unknown[]) {
  autoButtonEntry.value?.onAction(...args);
}

const draggableTo = computed(() => moduleDraggableHostSelector(c_mapId.value));
const btnTo = computed(() =>
  moduleCornerHostSelector(
    props.position as 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    c_mapId.value,
  ),
);

const bindDrag = computed(() =>
  buildModuleBindPosition({
    position: props.position as
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right',
    btnWidth: props.btnWidth,
    containerId: c_containerId.value,
  }),
);
</script>
