<script setup lang="ts">
import type { MapSimple, WithMapPropType } from '@hungpvq/map-core';
import type { MenuAction } from '@hungpvq/map-dataset';
import {
  handleMenuAction,
  hasMoveLayer,
  IGroupListViewUI,
  IListViewUI,
  listListViewGroups,
  traverseTree,
} from '@hungpvq/map-dataset';
import { ContextMenu } from '@hungpvq/vue-content-menu';
import {
  BaseButton,
  defaultMapProps,
  RegistryItem,
  useMap,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import {
  mdiDelete,
  mdiDotsVertical,
  mdiGroup,
  mdiLayers,
  mdiPlus,
} from '@mdi/js';
import {
  computed,
  nextTick,
  onMounted,
  ref,
  shallowReactive,
  VNode,
  watch,
} from 'vue';
import { useMapDataset } from '../../../store';
import { provideMenuConditionContext } from '../../../extra/menu/condition-context';
import ButtonToggleShowALl from './ButtonToggleAllShow.vue';
import DraggableGroupList from './DraggableList/draggable-list.vue';
import LayerItem from './item/layer-item.vue';
import LayerContextMenuList from './item/layer-context-menu-list.vue';

const props = withDefaults(
  defineProps<
    WithMapPropType & {
      disabledDrag?: boolean;
      disabled?: boolean;
      disabledCreateGroup?: boolean;
      disabledDeleteAll?: boolean;
      disabledMove?: boolean;
    }
  >(),
  {
    ...defaultMapProps,
    disabledDrag: false,
    disabled: false,
    disabledCreateGroup: false,
    disabledDeleteAll: false,
    disabledMove: false,
  },
);

provideMenuConditionContext(() => ({
  readonly: false,
  disabledMove: props.disabledMove,
  disabledCreateGroup: props.disabledCreateGroup,
}));

defineSlots<{
  title(): VNode[];
  item(props: {
    item: IListViewUI;
    isSelected: boolean;
    toggleSelect: (item: IListViewUI) => void;
  }): VNode[];
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

const groupRef = ref<InstanceType<typeof DraggableGroupList> | undefined>(
  undefined,
);
const layers_select = ref<IListViewUI[]>([]);

function updateLayers() {
  callMap((map: MapSimple) => {
    let beforeId: string = '';
    views.value.slice().forEach((view, index, items) => {
      view.index = items.length - index;
      const parent = view.getParent();
      traverseTree(
        parent || view,
        (node) => {
          if (hasMoveLayer(node)) {
            node.moveLayer(map, beforeId);
            beforeId = node.getBeforeId() || '';
          }
        },
        {
          direction: 'rtl',
        },
      );
    });
  });
}

function onRemoveGroupLayer(group: IGroupListViewUI<IListViewUI>) {
  if (
    !group ||
    typeof group === 'string' ||
    !group.children ||
    group.children.length === 0
  ) {
    return;
  }
  group.children.forEach((view: IListViewUI) => {
    removeComponent(view);
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
  if (groupRef.value) groupRef.value.update(views.value as any);
}

function getViewFromStore() {
  const viewSource = getAllComponentsByType<IListViewUI>('list');
  views.value = viewSource.sort((a, b) => b.index - a.index) || [];
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
  const treeGroups = groupRef.value?.getGroups?.() ?? [];
  return treeGroups.length > 0 ? treeGroups : listListViewGroups(views.value);
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
<template>
  <div class="layer-control-container">
    <div class="layer-control__header">
      <slot name="title"></slot>
      <div class="v-spacer"></div>
      <ButtonToggleShowALl :items="views" />
      <BaseButton @click="addNewGroup()" v-if="!disabledCreateGroup">
        <SvgIcon size="16" type="mdi" :path="path.group.create" />
      </BaseButton>
      <BaseButton @click="onRemoveAllLayer" v-if="!disabledDeleteAll">
        <SvgIcon size="16" type="mdi" :path="path.deleteAll" />
      </BaseButton>
    </div>
    <div class="layer-control__list">
      <DraggableGroupList
        ref="groupRef"
        v-model:items="views"
        v-model:selected="layers_select"
        :disabled="disabled"
        :disabled-drag="disabledDrag"
        @click-drag:done="updateLayers()"
        @click-group:remove="onRemoveGroupLayer"
      >
        <template #item="{ isSelected, item, toggleSelect }">
          <slot
            name="item"
            :item="item"
            :isSelected="isSelected"
            :toggleSelect="() => toggleSelect(item)"
          >
            <RegistryItem
              :componentKey="item.config?.componentKey"
              :item="item"
              :defaultComponent="LayerItem"
              :is-selected="isSelected"
              @click="toggleSelect(item)"
              @click:remove="onRemoveLayer"
              @click:content-menu="handleContextClick"
              @click:action="onLayerAction"
              :map-id="mapId"
              :readonly="false"
              :disabledMove="disabledMove"
              :disabledCreateGroup="disabledCreateGroup"
            >
            </RegistryItem>
          </slot>
        </template>
      </DraggableGroupList>
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
