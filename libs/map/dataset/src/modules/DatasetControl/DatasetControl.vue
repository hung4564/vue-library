<script lang="ts">
export default {
  name: 'dataset-control',
};
</script>

<script setup lang="ts">
import { DraggableItemSideBar } from '@hungpvq/vue-draggable';
import {
  BaseButton,
  defaultMapProps,
  MapCommonButton,
  ModuleContainer,
  useLang,
  useMap,
  useShow,
  useToolbarControl,
  WithMapPropType,
  WithShowProps,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiDatabaseOutline, mdiDelete, mdiInformation } from '@mdi/js';
import { computed, onMounted, shallowRef, watch } from 'vue';
import {
  createMenuClickAddComponentBuilder,
  createMenuClickBuilder,
  handleMenuActionClick,
} from '../../extra/menu';
import type { IDataset } from '../../interfaces/dataset.base';
import { useMapDataset } from '../../store';
const props = withDefaults(defineProps<WithMapPropType & WithShowProps>(), {
  ...defaultMapProps,
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
  delete: mdiDelete,
};
const [show, toggleShow] = useShow(props.show);
const { getDatasets, getDatasetIds, removeDataset } = useMapDataset(
  mapId.value,
);
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
    createMenuClickBuilder()
      .addTupleStatic('addComponent', {
        value: createMenuClickAddComponentBuilder()
          .setComponentKey('dataset-detail')
          .setAttr({
            dataset: view,
          })
          .setCheck('detail-dataset')
          .build(),
      })
      .build(),
    { layer: view, mapId: mapId.value, value: view },
  );
}
function onRemove(view: IDataset) {
  removeDataset(view);
}
onMounted(() => {
  updateList();
});
defineSlots<{
  item(props: { item: IDataset }): any;
  default(): any;
}>();
const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapHomeControl',
  getState() {
    return {
      visible: !show.value,
      active: show.value,
      title: trans.value('map.dataset-control.title'),
      icon: {
        type: 'mdi',
        path: path.icon,
      },
    };
  },
  onClick() {
    toggleShow();
  },
});
watch(show, () => control.sync());
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapCommonButton
        v-if="state"
        :option="state"
        @click.stop="control.onAction"
      >
      </MapCommonButton>
    </template>

    <template #draggable="props">
      <DraggableItemSideBar
        :containerId="props.containerId"
        v-model:show="show"
        :title="trans('map.dataset-control.title')"
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

                  <BaseButton @click.stop="onRemove(view)">
                    <SvgIcon size="16" type="mdi" :path="path.delete" />
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
