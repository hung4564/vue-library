<script setup lang="ts">
import { type WithMapPropType } from '@hungpvq/map-core';
import type { IListViewUI, MenuAction } from '@hungpvq/map-dataset';
import {
  convertListToTree,
  handleMenuAction,
  TreeItem,
} from '@hungpvq/map-dataset';
import { ContextMenu } from '@hungpvq/vue-content-menu';
import { defaultMapProps, RegistryItem, useMap } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import {
  mdiDelete,
  mdiDotsVertical,
  mdiGroup,
  mdiLayers,
  mdiPlus,
} from '@mdi/js';
import { getCurrentInstance, nextTick, onMounted, reactive, ref } from 'vue';
import { useMapDataset } from '../../../store';
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
const path = {
  icon: mdiLayers,
  menu: mdiDotsVertical,
  group: { create: mdiGroup },
  deleteAll: mdiDelete,
  layer: { create: mdiPlus },
};
const { mapId } = useMap(props);
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
const contextMenuRef = ref<
  | {
      open(event: MouseEvent, item: IListViewUI): void;
      close(): void;
    }
  | undefined
>();
const menu_context = reactive<{
  items: MenuAction<IListViewUI>[];
  view: IListViewUI | undefined;
}>({
  items: [],
  view: undefined,
});
function handleContextClick({
  event,
  item,
  actions,
}: {
  event: MouseEvent;
  item: IListViewUI;
  actions: MenuAction<IListViewUI>[];
}) {
  menu_context.items = actions ? [...actions] : ([] as any);
  menu_context.view = item;
  if (contextMenuRef.value) contextMenuRef.value.open(event, item);
}
function closeContextMenu() {
  menu_context.items = [];
  menu_context.view = undefined;
  if (contextMenuRef.value) contextMenuRef.value.close();
}
function onLayerAction({
  event,
  action,
  item,
}: {
  event: MouseEvent;
  action: MenuAction<IListViewUI>;
  item: IListViewUI;
}) {
  handleMenuAction(action, {
    event,
    layer: item,
    mapId: mapId.value,
    value: item,
  });
}
</script>
<template lang="">
  <div class="layer-control-container">
    <div class="layer-control__header">
      <div class="v-spacer"></div>
    </div>
    <div class="layer-control__list">
      <div v-for="(item, index) in treeLayer" :key="item.id || index">
        <RecursiveList :item="item" disabledDrag>
          <template #leaf="{ item }">
            <RegistryItem
              :componentKey="item.config?.componentKey"
              :defaultComponent="LayerItem"
              :item="item"
              @click:content-menu="handleContextClick"
              @click:action="onLayerAction"
              :mapId="mapId"
              readonly
            >
            </RegistryItem>
          </template>
        </RecursiveList>
      </div>
    </div>
    <ContextMenu ref="contextMenuRef">
      <ul class="layer-context-menu">
        <li
          v-for="(option, index) in menu_context.items"
          :key="index"
          @click.stop="
            onLayerAction({
              event: $event,
              action: option,
              item: menu_context.view,
            });
            closeContextMenu();
          "
          class="layer-context-menu__item"
          :class="[
            option.class,
            option.type === 'divider' ? 'layer-context-menu__divider' : '',
          ]"
        >
          <div class="layer-context-menu__item-icon">
            <SvgIcon
              size="16"
              type="mdi"
              :path="option.icon || mdiCircleSmall"
            />
          </div>
          <span v-html="option.name"></span>
        </li>
      </ul>
    </ContextMenu>
  </div>
</template>
