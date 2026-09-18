<template>
  <DraggableListItem :disabledDrag="disabledDrag" class="draggable-group__item">
    <div class="draggable-group__info">
      <span class="draggable-group__title" :title="layerGroup.name">
        {{ layerGroup.name }}
      </span>
      <div class="draggable-group__action">
        <MapControlButton
          v-if="
            !readonly && layerGroup.children && layerGroup.children.length > 0
          "
          variant="plain"
          size="small"
          @click="unGroup()"
        >
          <SvgIcon size="14" type="mdi" :path="path.group.unGroup" />
        </MapControlButton>
        <MapControlButton
          v-if="!readonly"
          @click="deleteGroup()"
          variant="plain"
          size="small"
        >
          <SvgIcon size="14" type="mdi" :path="path.group.delete" />
        </MapControlButton>
        <MapControlButton
          @click="toggleShowChildrenGroup()"
          variant="plain"
          size="small"
        >
          <SvgIcon
            size="14"
            type="mdi"
            :path="isGroupShow ? path.group.close : path.group.open"
          />
        </MapControlButton>
      </div>
    </div>
    <div v-if="isGroupShow" class="draggable-group__divider"></div>
    <div
      class="draggable-group__children-container"
      :class="{ _show: isGroupShow }"
    >
      <div class="draggable-group__children">
        <slot :group="layerGroup" name="item" />
      </div>
      <div
        v-if="
          isGroupShow &&
          (!layerGroup.children || layerGroup.children.length < 1)
        "
        class="draggable-group__nodata"
      >
        Drag layer inside this group
      </div>
    </div>
  </DraggableListItem>
</template>
<script setup lang="ts">
import { MapControlButton } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiChevronDown, mdiChevronUp, mdiDelete, mdiUngroup } from '@mdi/js';

import { ref } from 'vue';
import DraggableListItem from './draggable-list-item.vue';

defineProps({
  layerGroup: { type: Object, required: true },
  selected: { type: Array, default: () => [] },
  disabledSelect: Boolean,
  disabledDrag: Boolean,
  checkItemCanPutInChildren: { type: Function },
  readonly: Boolean,
});
const emit = defineEmits([
  'click:delete',
  'click:un-group',
  'click:select',
  'drag-done',
  'update:layer-group',
]);
const path = {
  group: {
    open: mdiChevronUp,
    close: mdiChevronDown,
    unGroup: mdiUngroup,
    delete: mdiDelete,
  },
};
const isGroupShow = ref(true);
function toggleShowChildrenGroup() {
  isGroupShow.value = !isGroupShow.value;
}
function deleteGroup() {
  emit('click:delete');
}
function unGroup() {
  emit('click:un-group');
}
</script>
