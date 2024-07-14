<template lang="">
  <DraggableListItem :disabledDrag="disabledDrag" class="draggable-group__item">
    <div class="draggable-group__info">
      <span class="draggable-group__title" :title="layerGroup.name">
        {{ layerGroup.name }}
      </span>
      <div class="draggable-group__action">
        <template v-if="layerGroup.children && layerGroup.children.length > 0">
          <span @click="unGroup()">
            <SvgIcon size="14" type="mdi" :path="path.group.unGroup" />
          </span>
        </template>

        <span @click="deleteGroup()">
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
        'draggable-group__children-container': isGroupShow,
      }"
    >
      <div
        v-if="!p_children || p_children.length < 1"
        class="draggable-group__nodata"
      >
        Drag layer inside this group
      </div>
      <div class="draggable-group__children" ref="child">
        <div
          class="draggable__item"
          v-for="element in p_children"
          :key="element.id"
          :data-id="element.id"
        >
          <DraggableListItem
            :disabledDrag="disabledDrag"
            :isSelected="selected.includes(element.id)"
            :item="element"
          >
            <slot
              :group="layerGroup"
              :isSelected="selected.includes(element.id)"
              :item="element"
              name="item"
              :toggleSelect="toggleSelect"
            ></slot>
          </DraggableListItem>
        </div>
      </div>
    </div>
  </DraggableListItem>
</template>
<script setup lang="ts">
import SvgIcon from '@jamescoyle/vue-icon';
import DraggableListItem from './draggable-list-item.vue';
import {
  mdiChevronDown,
  mdiChevronUp,
  mdiDelete,
  mdiEye,
  mdiEyeOff,
  mdiUngroup,
} from '@mdi/js';
import { nextTick, ref } from 'vue';
import { useStoreSortable } from '@hungpvq/shared-integrations';
const props = defineProps({
  layerGroup: { type: Object, required: true },
  selected: { type: Array, default: () => [] },
  disabledSelect: Boolean,
  disabledDrag: Boolean,
  checkItemCanPutInChildren: { type: Function },
  currentItemDrag: { type: Object },
});
const emit = defineEmits([
  'click:delete',
  'click:un-group',
  'click:select',
  'drag-done',
  'update:layer-group',
  'update:currentItemDrag',
]);
function toggleSelect() {
  emit('click:select');
}
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
const child = ref<HTMLElement | null>(null);
const p_children = ref<any[]>(props.layerGroup.children.slice());
useStoreSortable(
  child,
  {
    get() {
      return p_children.value;
    },
    set(value) {
      p_children.value = value;
      onEnd();
    },
  },
  {
    handle: '.draggable-handle',
    group: {
      name: 'layers',
      pull: true,
      put: props.checkItemCanPutInChildren as any,
    },
    onChoose(e) {
      emit(
        'update:currentItemDrag',
        e.oldIndex != null ? p_children.value[e.oldIndex] : undefined
      );
    },
  }
);
function onEnd() {
  nextTick(() => {
    emit('update:layer-group', {
      ...props.layerGroup,
      children: p_children.value,
    });
    emit('drag-done');
  });
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
