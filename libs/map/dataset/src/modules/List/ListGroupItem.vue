<template lang="">
  <ListItem :disabledDrag="disabledDrag" class="draggable-group__item">
    <div class="draggable-group__info">
      <span class="draggable-group__title" :title="item.name">
        {{ item.name }}
      </span>
      <div class="draggable-group__action">
        <slot name="extra-data" :item="item"></slot>
        <span @click="toggleShowChildrenGroup()">
          <SvgIcon
            size="14"
            type="mdi"
            :path="path.group.close"
            v-if="isGroupShow"
          />
          <SvgIcon size="14" type="mdi" :path="path.group.open" v-else />
        </span>
      </div>
    </div>
    <div v-if="isGroupShow" class="draggable-group__divider"></div>
    <div
      :class="{
        'draggable-group__children-container': true,
        _show: isGroupShow,
      }"
    >
      <slot name="items-list">
        <div
          v-if="!item.children || item.children.length === 0"
          class="draggable-group__nodata"
        >
          Drag layer inside this group
        </div>
      </slot>
    </div>
  </ListItem>
</template>
<script setup lang="ts">
import SvgIcon from '@jamescoyle/vue-icon';
import {
  mdiChevronDown,
  mdiChevronUp,
  mdiDelete,
  mdiEye,
  mdiEyeOff,
  mdiUngroup,
} from '@mdi/js';
import { ref, watch } from 'vue';
import ListItem from './ListItem.vue';
const props = defineProps({
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
<style scoped>
.draggable-group__item .draggable__item:last-child {
  padding-bottom: 0px;
}

.draggable-group__info {
  display: flex;
  padding-bottom: 4px;
  justify-content: center;
  align-items: center;
}

.draggable-group__title {
  display: inline-flex;
  text-align: left;
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.draggable-group__action {
  flex-grow: 0;
  display: flex;
}

.draggable-group__action span {
  cursor: pointer;
  display: inline-block;
  margin-left: 8px;
}

.draggable-group__children {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.draggable-group__children-container {
  position: relative;
  display: none;
}

.draggable-group__children-container._show {
  display: block;
}

.draggable-group__nodata {
  position: absolute;
  z-index: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  opacity: 0.5;
}
</style>
