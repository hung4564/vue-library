<script setup lang="ts">
import { BaseButton, useLang } from '@hungpvq/vue-map-core';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCrosshairsGps, mdiDeleteOutline } from '@mdi/js';
import { Feature } from 'geojson';
import { IDraftRecord } from '../../../types';

const props = defineProps<{
  show: boolean;
  draftItems: IDraftRecord[];
  mapId: string;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'fly-to', feature: Feature): void;
  (e: 'discard-item', item: IDraftRecord): void;
}>();

const { trans } = useLang(props.mapId);

const path = {
  delete: mdiDeleteOutline,
  fillBound: mdiCrosshairsGps,
};
</script>

<template>
  <DraggableItemPopup
    :height="400"
    :width="400"
    :show="show"
    @update:show="(val) => emit('update:show', val)"
    :title="trans('map.draw-control.draftList.title')"
  >
    <table class="draft-items-table">
      <thead>
        <tr>
          <th class="table-col-id">
            {{ trans('map.draw-control.draftList.field.id') }}
          </th>
          <th class="table-col-type">
            {{ trans('map.draw-control.draftList.field.type') }}
          </th>
          <th class="table-col-action">
            {{ trans('map.draw-control.draftList.field.action') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in draftItems" :key="item.id">
          <td :title="item.id + ''" class="table-col-id">{{ item.id }}</td>
          <td class="table-col-type">
            {{ trans('map.draw-control.draftList.type.' + item.status) }}
          </td>
          <td class="table-col-action">
            <BaseButton
              type="button"
              v-if="item.modified"
              @click="emit('fly-to', item.modified as any)"
              class="menu-item"
              :title="trans('map.draw-control.draftList.action.fillBound')"
            >
              <SvgIcon
                :size="16"
                type="mdi"
                :path="path.fillBound"
                :title="trans('map.draw-control.draftList.action.fillBound')"
              />
            </BaseButton>
            <BaseButton
              type="button"
              @click="emit('discard-item', item)"
              class="menu-item"
              :title="trans('map.draw-control.draftList.action.discard')"
            >
              <SvgIcon
                :size="16"
                type="mdi"
                :path="path.delete"
                :title="trans('map.draw-control.draftList.action.discard')"
              />
            </BaseButton>
          </td>
        </tr>
      </tbody>
    </table>
  </DraggableItemPopup>
</template>

<style scoped>
.draft-items-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.draft-items-table th,
.draft-items-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #ffffff30;
  text-align: left;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.draft-items-table thead th {
  font-weight: bold;
}
.table-col-action {
  width: 64px;
}
.menu-item {
  cursor: pointer;
}
</style>
