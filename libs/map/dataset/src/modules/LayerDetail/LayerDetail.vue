<script>
export default {
  name: 'detail-layer-info',
};
</script>

<script setup>
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import { ModuleContainer, useLang, useMap } from '@hungpvq/vue-map-core';
import { useMapDatasetHighlight } from '../../store';
import TableTdLayer from './table-td-layer.vue';
defineProps({
  item: {},
  view: {},
  fields: {
    type: Array,
    default: () => [],
  },
});
const { mapId } = useMap();
const { setFeatureHighlight } = useMapDatasetHighlight(mapId.value);
const { trans } = useLang(mapId.value);
const emit = defineEmits(['close']);
function onUpdateShow(val) {
  if (!val) {
    emit('close');
  }
}
function onClose() {
  setFeatureHighlight(undefined, 'detail');
}
</script>
<template>
  <ModuleContainer v-bind="$attrs">
    <template #draggable="props">
      <DraggableItemPopup
        v-bind="props"
        show
        @close="onClose"
        @update:show="onUpdateShow"
        :width="400"
      >
        <template #title>
          {{ trans('map.layer-control.info.title') }}
        </template>
        <div class="table-show-info">
          <div class="table-content">
            <TableTdLayer
              :field="field"
              :label="field.trans ? trans(field.trans) : field.text"
              :item="item"
              :view="view"
              v-for="(field, i) in fields"
              :key="i"
            />
          </div>
        </div>
      </DraggableItemPopup>
    </template>
  </ModuleContainer>
</template>

<style>
.table-show-info {
  max-width: 100%;
}

.table-content {
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;
}

.table-content > div:not(:last-child) {
  border-bottom: thin solid hsla(0, 0%, 100%, 0.12);
}
.table-content > div {
  min-height: 40px;
}

.table-content > div:hover {
  background: #616161;
}
.info-control-container {
  padding: 8px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
}
</style>
