<script setup lang="ts">
import { type WithMapPropType } from '@hungpvq/map-core';
import type { IListViewUI } from '@hungpvq/map-dataset';
import {
  LAYER_CONTROL_LOCALE,
  convertListToTree,
  listListViewGroups,
  TreeItem,
} from '@hungpvq/map-dataset';
import { MENU_CONTROL_ID } from '@hungpvq/map-dataset/menu';
import { defaultMapProps, RegistryItem, useLang, useMap } from '@hungpvq/vue-map-core';
import { getCurrentInstance, nextTick, onMounted, ref } from 'vue';
import { useMapDataset } from '../../../store';
import { provideMenuConditionContext } from '../../../extra/menu/condition-context';
import RecursiveList from '../../List/RecursiveList.vue';
import LayerItem from './item/layer-item.vue';

const props = withDefaults(
  defineProps<
    WithMapPropType & {
      disabledDrag?: boolean;
      disabled?: boolean;
    }
  >(),
  {
    ...defaultMapProps,
    disabledDrag: false,
    disabled: false,
  },
);
provideMenuConditionContext(() => ({
  readonly: true,
  control: MENU_CONTROL_ID.layerControl,
}));
const { mapId } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault(LAYER_CONTROL_LOCALE);
const { getAllComponentsByType } = useMapDataset(mapId.value);
const views = ref<Array<IListViewUI>>([]);
onMounted(() => {
  updateList();
});
function updateList() {
  getViewFromStore();
  nextTick(() => {
    updateTree();
  });
}

const instance = getCurrentInstance();
const treeLayer = ref<TreeItem[]>([]);

function updateTree() {
  treeLayer.value = convertListToTree(views.value as any);
  instance?.proxy?.$forceUpdate();
}
function getViewFromStore() {
  views.value =
    getAllComponentsByType<IListViewUI>('list').sort(
      (a, b) => b.index - a.index,
    ) || [];
}
function getMenuGroups() {
  return listListViewGroups(views.value);
}
</script>
<template lang="">
  <div class="layer-control-container">
    <div v-if="views.length" class="layer-control__header">
      <div class="v-spacer"></div>
    </div>
    <div class="layer-control__list">
      <div v-if="!views.length" class="layer-control__empty">
        <div class="layer-control__empty-title">
          {{ trans('map.layer-control.empty') }}
        </div>
      </div>
      <div v-for="(item, index) in treeLayer" :key="item.id || index">
        <RecursiveList :item="item" disabledDrag>
          <template #leaf="{ item }">
            <RegistryItem
              :componentKey="item.config?.componentKey"
              :defaultComponent="LayerItem"
              :item="item"
              :mapId="mapId"
              :getGroups="getMenuGroups"
              readonly
            >
            </RegistryItem>
          </template>
        </RecursiveList>
      </div>
    </div>
  </div>
</template>
