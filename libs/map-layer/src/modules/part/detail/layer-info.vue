<script>
export default {
  name: 'detail-layer-info',
};
</script>

<script setup>
import { DraggableItemPopup } from '@hungpv97/vue-draggable';
import { ModuleContainer, useLang, useMap } from '@hungpv97/vue-map-core';
import TableTdLayer from './table-td-layer.vue';
defineProps({
  item: {},
  option: {
    default: () => ({
      fields: [],
    }),
  },
});
const { mapId } = useMap();
const { trans } = useLang(mapId.value);
const emit = defineEmits(['close']);
function onUpdateShow(val) {
  if (!val) {
    emit('close');
  }
}
</script>
<template>
  <ModuleContainer v-bind="$attrs">
    <template #draggable="props">
      <DraggableItemPopup
        v-bind="props"
        show
        @update:show="onUpdateShow"
        :width="400"
      >
        <template #title>
          {{ trans('map.layer-control.info.title') }}
        </template>
        <div class="table-show-info">
          <table>
            <tbody>
              <TableTdLayer
                :field="field"
                :label="field.trans ? trans(field.trans) : field.text"
                :layer="item"
                v-for="(field, i) in option.fields"
                :key="i"
              >
              </TableTdLayer>
            </tbody>
          </table>
        </div>
      </DraggableItemPopup>
    </template>
  </ModuleContainer>
</template>

<style>
.table-show-info table {
  line-height: 1.5;
  width: 100%;
  border-spacing: 0;
}
.table-show-info table > tbody > tr > td {
  font-size: 0.875rem;
  height: 48px;
  padding: 0 16px;
  word-break: break-all;
}
.table-show-info table > tbody > tr:not(:last-child) > td {
  border-bottom: thin solid hsla(0, 0%, 100%, 0.12);
}
.table-show-info table > tbody > tr:hover {
  background: #616161;
}
.table-show-info {
  max-width: 100%;
}
</style>

<style scoped>
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
