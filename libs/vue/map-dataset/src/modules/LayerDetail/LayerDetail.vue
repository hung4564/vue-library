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
  popupProps: {
    type: Object,
    default: () => ({}),
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
        show
        @close="onClose"
        @update:show="onUpdateShow"
        :width="400"
        v-bind="{ ...props, ...popupProps }"
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
