<template>
  <ListItem :disabledDrag="disabledDrag" class="draggable-group__item">
    <div class="draggable-group__info">
      <span class="draggable-group__title" :title="item.name">
        {{ item.name }}
      </span>
      <div class="draggable-group__action">
        <slot name="extra-data" :item="item"></slot>
        <BaseButton @click="toggleShowChildrenGroup()">
          <SvgIcon
            size="14"
            type="mdi"
            :path="isGroupShow ? path.group.close : path.group.open"
          />
        </BaseButton>
      </div>
    </div>
    <div v-if="isGroupShow" class="draggable-group__divider"></div>
    <div
      class="draggable-group__children-container"
      :class="{ _show: isGroupShow }"
    >
      <div class="draggable-group__children">
        <slot name="items-list" />
      </div>
      <div
        v-if="isGroupShow && (!item.children || item.children.length === 0)"
        class="draggable-group__nodata"
      >
        Drag layer inside this group
      </div>
    </div>
  </ListItem>
</template>
<script setup lang="ts">
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import { BaseButton } from '@hungpvq/vue-map-core';
import { ref } from 'vue';
import ListItem from './ListItem.vue';

defineProps({
  item: { type: Object, required: true },
  selected: { type: Array, default: () => [] },
  disabledSelect: Boolean,
  disabledDrag: Boolean,
  readonly: Boolean,
});
const path = {
  group: {
    open: mdiChevronUp,
    close: mdiChevronDown,
  },
};
const isGroupShow = ref(true);
function toggleShowChildrenGroup() {
  isGroupShow.value = !isGroupShow.value;
}
</script>
