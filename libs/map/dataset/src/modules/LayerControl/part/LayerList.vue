<script setup lang="ts">
import { ContextMenu } from '@hungpvq/content-menu';
import type { MapSimple } from '@hungpvq/shared-map';
import { useMap, withMapProps } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import {
  mdiDelete,
  mdiDotsVertical,
  mdiGroup,
  mdiLayers,
  mdiPlus,
} from '@mdi/js';
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import type {
  IDataset,
  IGroupListViewUI,
  IListViewUI,
  IMapboxLayerView,
  MenuAction,
} from '../../../interfaces';
import { applyToAllLeaves, runAllComponentsWithCheck } from '../../../model';
import { handleMenuAction } from '../../../model/menu';
import { useMapDataset } from '../../../store';
import { isMapboxLayerView } from '../../../utils/check';
import ButtonToggleShowALl from './ButtonToggleAllShow.vue';
import DraggableGroupList from './DraggableList/draggable-list.vue';
import LayerItem from './item/layer-item.vue';
const props = defineProps({
  ...withMapProps,
  disabledDrag: Boolean,
  disabled: Boolean,
});

defineSlots<{
  title(): any;
  item(props: {
    item: IListViewUI;
    isSelected: boolean;
    toggleSelect: (item: IListViewUI) => void;
  }): any;
}>();
const path = {
  icon: mdiLayers,
  menu: mdiDotsVertical,
  group: { create: mdiGroup },
  deleteAll: mdiDelete,
  layer: { create: mdiPlus },
};
const { callMap, mapId } = useMap(props);
const { getAllComponentsByType, getDatasetIds, removeComponent } =
  useMapDataset(mapId.value);
const views = ref<Array<IListViewUI>>([]);
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
onMounted(() => {
  updateList();
});
const groupRef = ref<
  | {
      addNewGroup(name: string): void;
      update(items: any[]): void;
    }
  | undefined
>(undefined);
const layers_select = ref<IListViewUI[]>([]);
function updateLayers() {
  callMap((map: MapSimple) => {
    let beforeId: string = '';
    views.value.slice().forEach((view, index) => {
      view.index = index;
      applyToAllLeaves(view.getParent() as IDataset, [
        (leaf) => {
          if (isMapboxLayerView(leaf)) {
            leaf.moveLayer(map, beforeId);
            beforeId = leaf.getBeforeId();
          }
        },
      ]);
    });
  });
}
function onRemoveGroupLayer(group: IGroupListViewUI<IListViewUI>) {
  if (!group) {
    return;
  }
  if (typeof group == 'string') {
    return;
  }
  if (!group || !group.children || group.children.length === 0) {
    return;
  }
  group.children.forEach((view: IListViewUI) => {
    removeComponent(view);
  });
}
function onUpdateLayer(view: IListViewUI) {
  callMap((map: MapSimple) => {
    runAllComponentsWithCheck(
      view.getParent() as IDataset,
      (dataset): dataset is IDataset & IMapboxLayerView =>
        isMapboxLayerView(dataset),
      [
        (dataset) => {
          if (!view.config.disabled_opacity) {
            dataset.setOpacity(map, view.opacity);
          }
        },
      ],
    );
  });
}
function onRemoveLayer(view: IListViewUI) {
  if (!view) return;
  removeComponent(view);
  updateList();
}
function updateList() {
  getViewFromStore();
  nextTick(() => {
    updateTree();
  });
}
function updateTree() {
  if (groupRef.value) groupRef.value.update(views.value);
}
function getViewFromStore() {
  views.value =
    getAllComponentsByType<IListViewUI>('list').sort(
      (a, b) => b.index - a.index,
    ) || [];
}
function addNewGroup() {
  if (groupRef.value) groupRef.value.addNewGroup('');
}
function onRemoveAllLayer() {
  if (!views.value || views.value.length === 0) {
    return;
  }
  views.value.forEach((view) => {
    removeComponent(view);
  });
  updateList();
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
  menu_context.items = actions ? [...actions] : [];
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
      <slot name="title"></slot>
      <div class="v-spacer"></div>
      <ButtonToggleShowALl :items="views" />
      <button class="layer-item__button" @click="addNewGroup()">
        <SvgIcon size="16" type="mdi" :path="path.group.create" />
      </button>
      <button class="layer-item__button" @click="onRemoveAllLayer">
        <SvgIcon size="16" type="mdi" :path="path.deleteAll" />
      </button>
    </div>
    <div class="layer-control__list">
      <draggable-group-list
        ref="groupRef"
        v-model:items="views"
        v-model:selected="layers_select"
        :disabled="disabled"
        :disabledDrag="disabledDrag"
        @click-drag:done="updateLayers()"
        @click-group:remove="onRemoveGroupLayer"
      >
        <template #item="{ isSelected, item, toggleSelect }">
          <slot
            name="item"
            :item="item"
            :isSelected="isSelected"
            :toggleSelect="toggleSelect"
          >
            <component
              :is="item.component || LayerItem"
              :item="item"
              :isSelected="isSelected"
              @click="toggleSelect(item)"
              @update:item="onUpdateLayer"
              @click:remove="onRemoveLayer"
              @click:content-menu="handleContextClick"
              @click:action="onLayerAction"
              :mapId="mapId"
              :readonly="false"
            >
            </component>
          </slot>
        </template>
      </draggable-group-list>
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

.layer-control__header .layer-item__button {
  display: inline-flex;
  min-width: 20px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: transparent;
  box-shadow: unset;
  outline: none;
  border: none;
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
