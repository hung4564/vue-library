<script setup lang="ts">
import { MapControlButton, MapControlGroupButton } from '@hungpvq/vue-map-core';
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
import { isDraftOption } from '../../../store';
import { MapDrawOption } from '../../../types';

const props = defineProps<{
  drawOptions?: MapDrawOption;
  isShow: boolean;
  isDraw: boolean;
  method: string;
  draftCounts: number;
}>();

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'save'): void;
  (e: 'close'): void;
  (e: 'start-draw', event: MouseEvent): void;
  (e: 'select-method', method: 'select' | 'delete'): void;
  (e: 'commit'): void;
  (e: 'discard'): void;
  (e: 'show-list'): void;
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
</script>

<template>
  <div
    class="d-flex button-custom-container button-draw-container"
    v-if="drawOptions"
  >
    <template v-if="isShow">
      <MapControlGroupButton row v-if="isDraw">
        <MapControlButton @click="emit('cancel')">
          <SvgIcon :size="18" type="mdi" :path="path.discard" />
        </MapControlButton>
        <MapControlButton @click="emit('save')">
          <SvgIcon :size="18" type="mdi" :path="path.save" />
        </MapControlButton>
      </MapControlGroupButton>
      <MapControlGroupButton row v-else>
        <MapControlButton @click="emit('close')">
          <SvgIcon :size="18" type="mdi" :path="path.close" />
        </MapControlButton>
        <MapControlButton
          :active="method === 'create'"
          @click="(e) => emit('start-draw', e)"
        >
          <SvgIcon :size="18" type="mdi" :path="path.add" />
        </MapControlButton>
        <MapControlButton
          :active="method === 'select'"
          @click="emit('select-method', 'select')"
        >
          <SvgIcon :size="18" type="mdi" :path="path.update" />
        </MapControlButton>
        <MapControlButton
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
        @click="emit('commit')"
        :disabled="isDraw || draftCounts == 0"
      >
        <SvgIcon :size="18" type="mdi" :path="path.draftCommit" />
      </MapControlButton>
      <MapControlButton
        @click="emit('discard')"
        :disabled="isDraw || draftCounts == 0"
      >
        <SvgIcon :size="18" type="mdi" :path="path.draftDiscard" />
      </MapControlButton>
      <MapControlButton @click="emit('show-list')" :disabled="draftCounts == 0">
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
