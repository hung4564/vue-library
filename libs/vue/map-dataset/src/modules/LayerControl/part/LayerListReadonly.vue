<script setup lang="ts">
import { type WithMapPropType } from '@hungpvq/map-core';
import type { IListViewUI, MenuAction } from '@hungpvq/map-dataset';
import {
  LAYER_CONTROL_LOCALE,
  convertListToTree,
  handleMenuAction,
  listListViewGroups,
  TreeItem,
} from '@hungpvq/map-dataset';
import { ContextMenu } from '@hungpvq/vue-content-menu';
import { defaultMapProps, RegistryItem, useLang, useMap } from '@hungpvq/vue-map-core';
import {
  getCurrentInstance,
  nextTick,
  onMounted,
  ref,
  shallowReactive,
} from 'vue';
import { useMapDataset } from '../../../store';
import { provideMenuConditionContext } from '../../../extra/menu/condition-context';
import RecursiveList from '../../List/RecursiveList.vue';
import LayerContextMenuList from './item/layer-context-menu-list.vue';
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
const contextMenuRef = ref<
  | {
      open(_event: MouseEvent, _item: IListViewUI): void;
      close(): void;
    }
  | undefined
>();
const menu_context = shallowReactive<{
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
  menu_context.items = actions ? [...actions] : [];
  menu_context.view = item;
  if (contextMenuRef.value) contextMenuRef.value.open(event, item);
}
function getMenuGroups() {
  return listListViewGroups(views.value);
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
      <LayerContextMenuList
        :items="menu_context.items"
        :view="menu_context.view"
        :mapId="mapId"
        :getGroups="getMenuGroups"
        @close="closeContextMenu"
        @select="
          if (menu_context.view) {
            onLayerAction({
              action: $event.action,
              item: menu_context.view,
              event: $event.event,
            });
          }
          closeContextMenu();
        "
      />
    </ContextMenu>
  </div>
</template>
