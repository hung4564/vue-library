<script lang="ts">
export default {
  name: 'layer-control',
};
</script>

<script setup lang="ts">
import { DraggableItemSideBar } from '@hungpvq/vue-draggable';
import {
  BaseButton,
  makeShowProps,
  MapControlButton,
  ModuleContainer,
  useLang,
  useMap,
  useShow,
  withMapProps,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiDatabaseOutline, mdiInformation } from '@mdi/js';
import { computed, onMounted, shallowRef, watch } from 'vue';
import type { IDataset } from '../../interfaces/dataset.base';
import { handleMenuActionClick } from '../../model/menu';
import { useMapDataset } from '../../store';
import DatasetDetail from './DatasetDetail.vue';
const props = defineProps({
  ...withMapProps,
  ...makeShowProps({ show: false }),
});
const { mapId, moduleContainerProps } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault({
  map: {
    'dataset-control': {
      title: 'Dataset Control',
    },
  },
});
const path = {
  icon: mdiDatabaseOutline,
  detail: mdiInformation,
};
const [show, toggleShow] = useShow(props.show);
const { getDatasets, getDatasetIds } = useMapDataset(mapId.value);
const datasetIds = computed(() => {
  return getDatasetIds().value;
});
watch(
  datasetIds,
  () => {
    updateList();
  },
  { deep: true },
);
function updateList() {
  getViewFromStore();
}
const views = shallowRef<Array<IDataset>>([]);
function getViewFromStore() {
  views.value = getDatasets();
}
function onShowDetail(view: IDataset) {
  handleMenuActionClick(
    [
      [
        'addComponent',
        [
          view,
          mapId.value,
          {
            component: () => DatasetDetail,
            attr: {
              dataset: view,
            },
            check: 'detail-dataset',
          },
        ],
      ],
    ],
    view,
    mapId.value,
    view,
  );
}
onMounted(() => {
  updateList();
});
defineSlots<{
  item(props: { item: IDataset }): any;
  default(): any;
}>();
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlButton
        v-if="!show"
        @click.stop="toggleShow()"
        :active="show"
        :tooltip="trans('map.dataset-control.title')"
      >
        <SvgIcon size="14" type="mdi" :path="path.icon" />
      </MapControlButton>
    </template>

    <template #draggable="props">
      <DraggableItemSideBar
        :containerId="props.containerId"
        v-model:show="show"
      >
        <template #title> {{ trans('map.dataset-control.title') }} </template>
        <div class="dataset-control">
          <div v-for="view in views" :key="view.id">
            <slot name="item" :item="view">
              <div class="dataset-item">
                <span class="dataset-item__title">{{ view.getName() }}</span>
                <div class="dataset-item__title-action">
                  <BaseButton @click.stop="onShowDetail(view)">
                    <SvgIcon size="16" type="mdi" :path="path.detail" />
                  </BaseButton>
                </div>
              </div>
            </slot>
          </div>
        </div>
      </DraggableItemSideBar>
    </template>
    <slot />
  </ModuleContainer>
</template>

<style scoped lang="scss">
.dataset-control {
  display: flex;
  flex-direction: column;
  height: 100%;
  .dataset-item {
    .dataset-item__title {
      display: inline-block;
      text-align: left;
      flex-grow: 1;
      white-space: nowrap;
      overflow: hidden;
    }
    .dataset-item__title-action {
      display: flex;
      flex-grow: 0;
      align-items: center;
    }
    display: flex;
    min-height: 30px;
    padding: 4px 8px;
  }
}
</style>
