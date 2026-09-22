<template>
  <div
    class="draggable-group__treeitem"
    role="treeitem"
    tabindex="0"
    :aria-expanded="isGroupShow"
    :aria-label="layerGroup.name"
  >
    <DraggableListItem :disabledDrag="disabledDrag" class="draggable-group__item">
      <div class="draggable-group__info">
        <input
          v-if="editing"
          ref="inputRef"
          class="draggable-group__title-input"
          type="text"
          :value="draftName"
          :aria-label="renameLabel"
          @input="onDraftInput"
          @keydown="onRenameKeydown"
          @blur="commitRename"
          @click.stop
        />
        <button
          v-else
          type="button"
          class="draggable-group__title"
          :title="layerGroup.name"
          :disabled="readonly"
          :aria-label="renameLabel"
          @click.stop="startRename"
        >
          {{ layerGroup.name }}
        </button>
        <div class="draggable-group__action">
          <MapControlButton
            v-if="!readonly && !editing"
            variant="plain"
            size="small"
            :title="renameLabel"
            :aria-label="renameLabel"
            @click.stop="startRename"
          >
            <SvgIcon size="14" type="mdi" :path="path.group.rename" />
          </MapControlButton>
          <MapControlButton
            v-if="
              !readonly && layerGroup.children && layerGroup.children.length > 0
            "
            variant="plain"
            size="small"
            title="Ungroup"
            @click="unGroup()"
          >
            <SvgIcon size="14" type="mdi" :path="path.group.unGroup" />
          </MapControlButton>
          <MapControlButton
            v-if="!readonly"
            @click="deleteGroup()"
            variant="plain"
            size="small"
            title="Delete group"
          >
            <SvgIcon size="14" type="mdi" :path="path.group.delete" />
          </MapControlButton>
          <MapControlButton
            data-map-layer-group-toggle
            @click="toggleShowChildrenGroup()"
            variant="plain"
            size="small"
            title="Toggle group"
            :aria-expanded="isGroupShow"
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
        <slot :group="layerGroup" name="item" />
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
  </div>
</template>
<script setup lang="ts">
import { MapControlButton, useLang, useMap } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import {
  mdiChevronDown,
  mdiChevronUp,
  mdiDelete,
  mdiPencil,
  mdiUngroup,
} from '@mdi/js';

import { computed, nextTick, ref } from 'vue';
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
const { mapId } = useMap();
const { trans } = useLang(mapId.value);
const renameLabel = computed(() =>
  trans.value('map.layer-control.group.rename'),
);
const path = {
  group: {
    open: mdiChevronUp,
    close: mdiChevronDown,
    unGroup: mdiUngroup,
    delete: mdiDelete,
    rename: mdiPencil,
  },
};
const isGroupShow = ref(true);
const editing = ref(false);
const draftName = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

function toggleShowChildrenGroup() {
  isGroupShow.value = !isGroupShow.value;
}
function deleteGroup() {
  emit('click:delete');
}
function unGroup() {
  emit('click:un-group');
}

function startRename() {
  if (props.readonly) return;
  draftName.value = String(props.layerGroup.name ?? '');
  editing.value = true;
  nextTick(() => {
    inputRef.value?.focus();
    inputRef.value?.select();
  });
}

function onDraftInput(event: Event) {
  draftName.value = (event.target as HTMLInputElement).value;
}

function cancelRename() {
  editing.value = false;
  draftName.value = '';
}

function commitRename() {
  if (!editing.value) return;
  const trimmed = draftName.value.trim();
  editing.value = false;
  if (!trimmed || trimmed === props.layerGroup.name) {
    draftName.value = '';
    return;
  }
  emit('update:layer-group', { ...props.layerGroup, name: trimmed });
  draftName.value = '';
}

function onRenameKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault();
    (event.target as HTMLInputElement).blur();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    cancelRename();
  }
}
</script>
