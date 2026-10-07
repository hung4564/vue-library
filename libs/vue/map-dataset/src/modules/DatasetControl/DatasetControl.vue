<script lang="ts">
export default {
  name: 'dataset-control',
};
</script>

<script setup lang="ts">
import { type WithMapPropType } from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import type { IDataset } from '@hungpvq/map-dataset';
import {
  createMenuClickAddComponentBuilder,
  createMenuClickBuilder,
  handleMenuActionClick,
  LIST_VIEW_MENU_COMPONENT_KEY,
  LIST_VIEW_MENU_ID,
} from '@hungpvq/map-dataset/menu';
import { DraggableItemSideBar } from '@hungpvq/vue-draggable';
import {
  defaultMapProps,
  MapControlButton,
  ModuleContainer,
  useLang,
  useMap,
  useMapControl,
  useShow,
  type WithShowProps,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiDatabaseOutline, mdiDelete, mdiInformation } from '@mdi/js';
import { shallowRef, watch } from 'vue';

import { defineProps, defineSlots, withDefaults } from 'vue';
import { useMapDataset } from '../../store/dataset-api';
const props = withDefaults(defineProps<WithMapPropType & WithShowProps>(), {
  ...defaultMapProps,
});
const { mapId, order } = useMap(props);
const { trans } = useLang(mapId.value);
const path = {
  icon: mdiDatabaseOutline,
  detail: mdiInformation,
  delete: mdiDelete,
};
const [show, setShow] = useShow(props.show);
const { getDatasets, removeDataset, datasetVersion } = useMapDataset(mapId);
const views = shallowRef<Array<IDataset>>([]);
function getViewFromStore() {
  views.value = getDatasets();
}
function updateList() {
  getViewFromStore();
}
watch([datasetVersion, mapId], () => updateList(), { immediate: true });
function onShowDetail(view: IDataset) {
  handleMenuActionClick(
    createMenuClickBuilder()
      .addTupleStatic(LIST_VIEW_MENU_ID.addComponent, {
        value: createMenuClickAddComponentBuilder()
          .setComponentKey(LIST_VIEW_MENU_COMPONENT_KEY.datasetDetail)
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
defineSlots<{
  item(props: { item: IDataset }): any;
  default(): any;
}>();
const singleButton = {
  kind: 'single' as const,
  getState() {
    return mdiButtonState(path.icon, {
      active: show.value,
      title: trans.value('map.dataset-control.title'),
      order: order.value,
    });
  },
  onClick() {
    setShow();
  },
};
const { moduleContainerProps, panelPosition, control } = useMapControl(mapId, {
  id: 'mapDatasetControl',
  panelKind: 'sidebar',
  title: () => trans.value('map.dataset-control.title'),
  from: props,
  order,
  show,
  setShow,
  actions: [
    {
      type: 'mapDatasetControl',
      run: () => setShow(),
    },
  ],
  host: { button: singleButton },
  toolbar: singleButton,
});
watch(show, () => control.sync());
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #draggable="props">
      <DraggableItemSideBar
        :containerId="props.containerId"
        v-model:show="show"
        :title="trans('map.dataset-control.title')"
        :location="panelPosition.location || 'left'"
      >
        <div class="dataset-control">
          <template
            v-for="view in views"
            :key="view.id"
          >
            <slot
              name="item"
              :item="view"
            >
              <div class="dataset-item">
                <span class="dataset-item__title">{{ view.getName() }}</span>
                <div class="dataset-item__title-action">
                  <MapControlButton
                    @click.stop="onShowDetail(view)"
                    variant="plain"
                  >
                    <SvgIcon
                      size="16"
                      type="mdi"
                      :path="path.detail"
                    />
                  </MapControlButton>

                  <MapControlButton
                    @click.stop="onRemove(view)"
                    variant="plain"
                  >
                    <SvgIcon
                      size="16"
                      type="mdi"
                      :path="path.delete"
                    />
                  </MapControlButton>
                </div>
              </div>
            </slot>
          </template>
        </div>
      </DraggableItemSideBar>
    </template>
    <slot />
  </ModuleContainer>
</template>
