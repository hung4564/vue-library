<script setup lang="ts">
import type {
  IGroupListView,
  ILayer,
  IListView,
  IView,
  Menu,
} from '@hungpvq/vue-map-core';
import { ContextMenu } from '@hungpvq/content-menu';
import DraggableGroupList from './DraggableList/draggable-list.vue';
import SvgIcon from '@jamescoyle/vue-icon';
import { useMap, withMapProps } from '@hungpvq/vue-map-core';
import {
  mdiCircleSmall,
  mdiDelete,
  mdiDotsVertical,
  mdiGroup,
  mdiLayers,
  mdiPlus,
} from '@mdi/js';
import { BBox } from '@turf/turf';
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { getLayerFromView } from '../../helper';
import { getAllLayersByView, getLayerIds, removeLayer } from '../../store';
import LayerItem from './item/layer-item.vue';
const props = defineProps({
  ...withMapProps,
  disabledDrag: Boolean,
  disabled: Boolean,
});
const emit = defineEmits(['click:create']);
const path = {
  icon: mdiLayers,
  menu: mdiDotsVertical,
  group: { create: mdiGroup },
  deleteAll: mdiDelete,
  layer: { create: mdiPlus },
};
const { callMap, mapId } = useMap(props);
const layerids = computed(() => {
  return getLayerIds(mapId.value).value;
});
watch(
  layerids,
  () => {
    getViewFromStore();
    nextTick(() => {
      updateTree();
    });
  },
  { deep: true }
);
const views = ref<IListView[]>([]);
onMounted(() => {
  getViewFromStore();
  updateTree();
});
const groupRef = ref<
  | {
      addNewGroup(name: string): void;
      update(items: any[]): void;
    }
  | undefined
>(undefined);
const layers_select = ref<IListView[]>([]);
function updateLayers() {
  callMap((map) => {
    let beforeId: string = '';
    views.value
      .slice()
      .reverse()
      .forEach(async (view, index) => {
        view.index = index;
        let layer = getLayerFromView(view as IView);
        if (!layer) return;
        layer.run('moveLayer', map, beforeId);
        beforeId = (await layer.run(
          'getBeforeId',
          map,
          beforeId
        )) as unknown as string;
      });
  });
}
function onRemoveGroupLayer(group: IGroupListView<IListView>) {
  if (!group) {
    return;
  }
  if (typeof group == 'string') {
    return;
  }
  if (!group || !group.children || group.children.length === 0) {
    return;
  }
  group.children.forEach((view: IListView) => {
    let layer = getLayerFromView(view);
    if (!layer) return;
    removeLayer(mapId.value, layer);
  });
}
function onUpdateLayer(view: IListView) {
  callMap((map) => {
    let layer = getLayerFromView(view);
    if (!layer) return;
    layer.run('toggleShow', map, view.show);

    if (!view.config.disabled_opacity) {
      layer.run('setOpacity', map, view.opacity);
    }
  });
}
function onToBounds(bounds: BBox) {
  if (!bounds) {
    return;
  }
  callMap((map: any) => {
    map.fitBounds(bounds, {
      padding: 50,
      duration: 10,
    });
  });
}
function onRemoveLayer(view: IListView) {
  if (!view) return;
  let layer = getLayerFromView(view);
  if (!layer) return;
  removeLayer(mapId.value, layer);
}
function updateTree() {
  if (groupRef.value) groupRef.value.update(views.value);
}
function getViewFromStore() {
  if (!views.value) return;
  views.value = getAllLayersByView<IListView>(mapId.value, 'list').sort(
    (a, b) => b.index - a.index
  );
}
function openAddLayer() {
  emit('click:create');
}
function addNewGroup() {
  if (groupRef.value) groupRef.value.addNewGroup('');
}
function onRemoveAllLayer() {
  if (!views.value || views.value.length === 0) {
    return;
  }
  views.value.forEach((view) => {
    let layer = getLayerFromView(view as IView);
    if (!layer) return;
    removeLayer(mapId.value, layer);
  });
}
const contextMenuRef = ref<
  | {
      open(event: MouseEvent, item: IListView): void;
      close(): void;
    }
  | undefined
>();
const menu_context = reactive<{
  items: Menu[];
  view: IListView | undefined;
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
  item: IListView;
  actions: Menu[];
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
const LAYER_ACTION: { [key: string]: (item: IListView, layer: ILayer) => any } =
  {
    'to-bound': (item: IListView) => {
      onToBounds(item.metadata.bounds);
    },
    'toggle-show': (item: IListView) => {
      item.show = !item.show;
      onUpdateLayer(item);
    },
  };
function onLayerAction({ action, item }: { action: Menu; item: IListView }) {
  const menu = action;
  if (!menu) return;
  if (menu.type !== 'item') return;
  if (!item) return;
  let layer = getLayerFromView(item);
  if (!layer) return;
  const layer_action = layer.getView('action');
  const menu_layer = layer_action.get(menu.id);
  if (menu_layer.type && LAYER_ACTION[menu_layer.type]) {
    LAYER_ACTION[menu_layer.type](item, layer);
  } else {
    layer_action.call(menu.id, mapId.value);
  }
}
</script>
<template lang="">
  <div class="layer-control-container">
    <div class="layer-control__header">
      <button class="layer-item__button" @click.stop="openAddLayer()">
        <SvgIcon size="14" type="mdi" :path="path.layer.create" />
      </button>
      <div class="v-spacer"></div>
      <button class="layer-item__button" @click="addNewGroup()">
        <SvgIcon size="14" type="mdi" :path="path.group.create" />
      </button>
      <button class="layer-item__button" @click="onRemoveAllLayer">
        <SvgIcon size="14" type="mdi" :path="path.deleteAll" />
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
              size="14"
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

  // Have to use the element so we can make use of `first-of-type` and
  // `last-of-type`
  li {
    &:first-of-type {
      margin-top: 4px;
    }

    &:last-of-type {
      margin-bottom: 4px;
    }
  }
}
</style>
