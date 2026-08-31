<script setup lang="ts">
import type { MapSimple, WithMapPropType } from '@hungpvq/map-core';
import type { MenuAction } from '@hungpvq/map-dataset';
import {
  handleMenuAction,
  hasMoveLayer,
  IGroupListViewUI,
  IListViewUI,
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
  mdiCircleSmall,
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
  reactive,
  ref,
  VNode,
  watch,
} from 'vue';
import { useMapDataset } from '../../../store';
import ButtonToggleShowALl from './ButtonToggleAllShow.vue';
import DraggableGroupList from './DraggableList/draggable-list.vue';
import LayerItem from './item/layer-item.vue';

const props = withDefaults(
  defineProps<
    WithMapPropType & {
      disabledDrag?: boolean;
      disabled?: boolean;
      disabledCreateGroup?: boolean;
      disabledDeleteAll?: boolean;
    }
  >(),
  {
    ...defaultMapProps,
    disabledDrag: false,
    disabled: false,
    disabledCreateGroup: false,
    disabledDeleteAll: false,
  },
);

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
  menu_context.items = (actions ? [...actions] : []) as any;
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
            >
            </RegistryItem>
          </slot>
        </template>
      </DraggableGroupList>
    </div>
    <ContextMenu ref="contextMenuRef">
      <ul class="layer-context-menu">
        <li
          v-for="(option, index) in menu_context.items"
          :key="index"
          class="layer-context-menu__item"
          :class="[
            option.class,
            option.type === 'divider' ? 'layer-context-menu__divider' : '',
          ]"
          @click.stop="
            if (option.type !== 'divider' && menu_context.view) {
              onLayerAction({
                action: option as any,
                item: menu_context.view,
                event: $event,
              });
            }
            closeContextMenu();
          "
        >
          <!-- Divider -->
          <template v-if="option.type === 'divider'">
            <div class="layer-context-menu__divider-line"></div>
          </template>
          <template v-else-if="'componentKey' in option">
            <!-- item dạng component -->
            <component :is="option.componentKey" />
          </template>
          <!-- Normal item -->
          <template v-else>
            <div class="layer-context-menu__item-icon">
              <SvgIcon
                size="16"
                type="mdi"
                :path="option.icon || mdiCircleSmall"
              />
            </div>
            <span v-html="option.name"></span>
          </template>
        </li>
      </ul>
    </ContextMenu>
  </div>
</template>
