<template lang="">
  <DraggableListItem :disabledDrag="disabledDrag" class="draggable-group__item">
    <div class="draggable-group__info">
      <span class="draggable-group__title" :title="layerGroup.name">
        {{ layerGroup.name }}
      </span>
      <div class="draggable-group__action">
        <template
          v-if="
            !readonly && layerGroup.children && layerGroup.children.length > 0
          "
        >
          <span @click="unGroup()">
            <SvgIcon size="14" type="mdi" :path="path.group.unGroup" />
          </span>
        </template>

        <span @click="deleteGroup()" v-if="!readonly">
          <SvgIcon size="14" type="mdi" :path="path.group.delete" />
        </span>
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
      <slot :group="layerGroup" name="item">
        <div
          v-if="!p_children || p_children.length < 1"
          class="draggable-group__nodata"
        >
          Drag layer inside this group
        </div>
      </slot>
    </div>
  </DraggableListItem>
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
import { ref } from 'vue';
import DraggableListItem from './draggable-list-item.vue';
const props = defineProps({
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
    show: mdiEye,
    hide: mdiEyeOff,
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
.draggable-group__children-container,
.draggable-group__children {
  min-height: 80px;
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
