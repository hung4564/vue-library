<script setup lang="ts">
import { ContextMenu } from '@hungpvq/content-menu';
import {
  defaultMapProps,
  useMap,
  WithMapPropType,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import {
  mdiDelete,
  mdiDotsVertical,
  mdiGroup,
  mdiLayers,
  mdiPlus,
} from '@mdi/js';
import { getCurrentInstance, nextTick, onMounted, reactive, ref } from 'vue';
import { handleMenuAction } from '../../../extra/menu';
import type { IListViewUI, MenuAction } from '../../../interfaces';
import { useMapDataset } from '../../../store';
import { convertListToTree, TreeItem } from '../../../utils/tree';
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
  action,
  item,
}: {
  action: MenuAction<IListViewUI>;
  item: IListViewUI;
}) {
  handleMenuAction(action, item, mapId.value, item);
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
            <component
              :is="item.component || LayerItem"
              :item="item"
              @click:content-menu="handleContextClick"
              @click:action="onLayerAction"
              :mapId="mapId"
              readonly
            >
            </component>
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
            onLayerAction({ action: option, item: menu_context.view });
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
<style lang=""></style>
<style scoped>
.layer-control__list {
  flex-grow: 1;
  overflow: auto;
  padding: 4px 12px 8px;
}

.layer-control__header {
  display: flex;
  align-items: center;
  padding: 8px;
}

.v-spacer {
  flex: 1 1 auto;
}
</style>

<style lang="scss">
$light-grey: #ecf0f1;
$grey: darken($light-grey, 15%);
$blue: #004e98;
$white: #fff;
$black: #333;

.layer-context-menu {
  min-width: 150px;
  background-color: $light-grey;
  border-bottom-width: 0px;
  box-shadow: 0 3px 6px 0 rgba($black, 0.2);

  &--active {
    display: block;
  }

  &__item {
    display: flex;
    color: $black;
    cursor: pointer;
    padding: 5px 10px;
    align-items: center;
    min-width: 100px;
    min-height: 50px;

    &:hover {
      background-color: $blue;
      color: $white;
    }
  }

  &__item-icon {
    & > * {
      vertical-align: middle;
    }

    display: inline-block;
    padding-right: 5px;
  }

  &__divider {
    box-sizing: content-box;
    height: 2px;
    background-color: $grey;
    padding: 4px 0;
    background-clip: content-box;
    pointer-events: none;
  }
}
</style>
