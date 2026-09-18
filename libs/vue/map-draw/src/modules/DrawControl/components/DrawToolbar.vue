<script setup lang="ts">
import { MapControlButton, MapControlGroupButton } from '@hungpvq/vue-map-core';
import type { MapDrawOption } from '@hungpvq/map-draw';
import SvgIcon from '@jamescoyle/vue-icon';
import {
  mdiClose,
  mdiContentSave,
  mdiContentSaveCheck,
  mdiDeleteOutline,
  mdiDraw,
  mdiPencil,
  mdiPlus,
  mdiUndoVariant,
  mdiViewListOutline,
} from '@mdi/js';
import { isDraftOption } from '@hungpvq/map-draw';

const props = defineProps<{
  drawOptions?: MapDrawOption;
  isShow: boolean;
  isDraw: boolean;
  method: string;
  draftCounts: number;
}>();

const emit = defineEmits<{
  cancel: [];
  save: [];
  close: [];
  'start-draw': [event: MouseEvent];
  'select-method': [method: 'select' | 'delete'];
  commit: [];
  discard: [];
  'show-list': [];
}>();

const path = {
  add: mdiPlus,
  delete: mdiDeleteOutline,
  update: mdiPencil,
  save: mdiContentSave,
  discard: mdiClose,
  close: mdiClose,
  draw: mdiDraw,
  draftCommit: mdiContentSaveCheck,
  draftDiscard: mdiUndoVariant,
  draftList: mdiViewListOutline,
};

function onToolbarKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return;
  if (!props.isShow || !props.isDraw) return;
  event.preventDefault();
  emit('cancel');
}
</script>

<template>
  <div
    class="d-flex button-custom-container button-draw-container"
    role="toolbar"
    aria-label="Draw tools"
    v-if="drawOptions"
    @keydown="onToolbarKeydown"
  >
    <template v-if="isShow">
      <MapControlGroupButton row v-if="isDraw">
        <MapControlButton title="Cancel" @click="emit('cancel')">
          <SvgIcon :size="18" type="mdi" :path="path.discard" />
        </MapControlButton>
        <MapControlButton title="Save" @click="emit('save')">
          <SvgIcon :size="18" type="mdi" :path="path.save" />
        </MapControlButton>
      </MapControlGroupButton>
      <MapControlGroupButton row v-else>
        <MapControlButton title="Close" @click="emit('close')">
          <SvgIcon :size="18" type="mdi" :path="path.close" />
        </MapControlButton>
        <MapControlButton
          title="Draw"
          :active="method === 'create'"
          @click="emit('start-draw', $event)"
        >
          <SvgIcon :size="18" type="mdi" :path="path.add" />
        </MapControlButton>
        <MapControlButton
          title="Select"
          :active="method === 'select'"
          @click="emit('select-method', 'select')"
        >
          <SvgIcon :size="18" type="mdi" :path="path.update" />
        </MapControlButton>
        <MapControlButton
          title="Delete"
          :active="method === 'delete'"
          @click="emit('select-method', 'delete')"
        >
          <SvgIcon :size="18" type="mdi" :path="path.delete" />
        </MapControlButton>
      </MapControlGroupButton>
    </template>
    <MapControlGroupButton
      row
      v-if="isDraftOption(drawOptions) && drawOptions.draft.show"
    >
      <MapControlButton
        title="Commit drafts"
        @click="emit('commit')"
        :disabled="isDraw || draftCounts == 0"
      >
        <SvgIcon :size="18" type="mdi" :path="path.draftCommit" />
      </MapControlButton>
      <MapControlButton
        title="Discard drafts"
        @click="emit('discard')"
        :disabled="isDraw || draftCounts == 0"
      >
        <SvgIcon :size="18" type="mdi" :path="path.draftDiscard" />
      </MapControlButton>
      <MapControlButton
        title="Draft list"
        @click="emit('show-list')"
        :disabled="draftCounts == 0"
      >
        <SvgIcon
          :size="18"
          type="mdi"
          :path="path.draftList"
          :disabled="draftCounts == 0"
        />
        <span
          class="draft-item-count-badge map-control-badge"
          v-if="draftCounts"
          >{{ draftCounts }}</span
        >
      </MapControlButton>
    </MapControlGroupButton>
  </div>
</template>

<style scoped>
.button-draw-container {
  display: flex;
  gap: 4px;
}
.map-control-badge {
  position: absolute;
  top: -6px;
  right: 2px;
  padding: 2px 6px;
  font-size: 0.5rem;
  font-weight: bold;
  border-radius: 999px;
  min-width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.draft-item-count-badge {
  background: var(--map-draw-badge-bg, var(--map-primary-color, #004e98));
  color: var(--map-draw-badge-text, var(--map-text-inverse, white));
}
</style>
