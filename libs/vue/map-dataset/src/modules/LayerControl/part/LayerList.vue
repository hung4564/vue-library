<script setup lang="ts">

import type { MapSimple, WithMapPropType } from '@hungpvq/map-core';
import { layerMatchesSearch, listListViewGroups, syncListViewLayerOrder, type LayerListGroupTree, type LayerListItem, type IListViewUI } from '@hungpvq/map-dataset';
import { MENU_CONTROL_ID } from '@hungpvq/map-dataset/menu';
import { defaultMapProps, MapControlButton, RegistryItem, useLang, useMap } from '@hungpvq/vue-map-core';
import { InputText } from '@hungpvq/vue-map-core/fields';
import SvgIcon from '@jamescoyle/vue-icon';
import {
  mdiClose,
  mdiDelete,
  mdiGroup,
  mdiLayers,
  mdiPlus,
} from '@mdi/js';
import {
  computed,
  nextTick,
  onUnmounted,
  ref,
  VNode,
  watch,
} from 'vue';
import { useMapDataset } from '../../../store/dataset-api';
import { provideMenuConditionContext } from '../../../extra/menu/condition-context';
import ButtonToggleShowALl from './ButtonToggleAllShow.vue';
import DraggableGroupList from './DraggableList/draggable-list.vue';
import LayerItem from './item/layer-item.vue';
const props = withDefaults(
  defineProps<
    WithMapPropType & {
      disabledDrag?: boolean;
      disabled?: boolean;
      disabledCreate?: boolean;
      disabledCreateGroup?: boolean;
      disabledDeleteAll?: boolean;
      disabledMove?: boolean;
    }
  >(),
  {
    ...defaultMapProps,
    disabledDrag: false,
    disabled: false,
    disabledCreate: false,
    disabledCreateGroup: false,
    disabledDeleteAll: false,
    disabledMove: false,
  },
);
const emit = defineEmits<{
  create: [];
}>();
provideMenuConditionContext(() => ({
  readonly: false,
  disabledMove: props.disabledMove,
  disabledCreateGroup: props.disabledCreateGroup,
  control: MENU_CONTROL_ID.layerControl,
}));
defineSlots<{
  title: () => VNode[];
  item: (_props: {
    item: IListViewUI;
    isSelected: boolean;
    toggleSelect: (_item: IListViewUI) => void;
  }) => VNode[];
}>();
const path = {
  icon: mdiLayers,
  group: { create: mdiGroup },
  deleteAll: mdiDelete,
  layer: { create: mdiPlus },
};
const { callMap, mapId } = useMap(props);
const { trans } = useLang(mapId.value);
const { getAllComponentsByType, removeComponent, datasetVersion } =
  useMapDataset(mapId);
const views = ref<Array<LayerListItem>>([]);
const layerSearch = ref('');
const debouncedSearch = ref('');
let searchTimer: ReturnType<typeof setTimeout> | undefined;
const listDisabledDrag = computed(
  () => props.disabledDrag || Boolean(debouncedSearch.value.trim()),
);
function getFilteredViews() {
  const q = debouncedSearch.value;
  if (!q.trim()) return views.value;
  return views.value.filter((view) => layerMatchesSearch(view, q));
}
const filteredViews = computed(() => getFilteredViews());
watch([datasetVersion, mapId], () => updateList(), { immediate: true });
watch(layerSearch, (value) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    debouncedSearch.value = value;
    nextTick(() => updateTree());
  }, 150);
});
onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer);
});
const groupRef = ref<InstanceType<typeof DraggableGroupList> | undefined>(
  undefined,
);
const layers_select = ref<LayerListItem[]>([]);
function updateLayers() {
  callMap((map: MapSimple) => {
    syncListViewLayerOrder(map, views.value.slice());
  });
}
function onRemoveGroupLayer(group: LayerListGroupTree) {
  if (!group || !group.children || group.children.length === 0) {
    return;
  }
  group.children.forEach((view: LayerListItem) => {
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
  if (groupRef.value) groupRef.value.update(filteredViews.value);
}
function getViewFromStore() {
  const viewSource = getAllComponentsByType<LayerListItem>('list');
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
function getMenuGroups() {
  const treeGroups = groupRef.value?.getGroups?.() ?? [];
  return treeGroups.length > 0 ? treeGroups : listListViewGroups(views.value);
}
function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'BUTTON' ||
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    tag === 'A' ||
    target.isContentEditable
  );
}
function onTreeKeydown(event: KeyboardEvent) {
  if (isInteractiveTarget(event.target)) return;
  const tree = event.currentTarget as HTMLElement;
  const items = Array.from(
    tree.querySelectorAll<HTMLElement>('[role="treeitem"]'),
  );
  if (!items.length) return;
  const active = document.activeElement;
  const currentIndex = items.findIndex(
    (el) => el === active || el.contains(active),
  );
  const current = currentIndex >= 0 ? items[currentIndex] : null;

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const delta = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex =
      currentIndex < 0
        ? event.key === 'ArrowDown'
          ? 0
          : items.length - 1
        : Math.max(0, Math.min(items.length - 1, currentIndex + delta));
    items[nextIndex]?.focus();
    return;
  }

  if (!current) return;
  const expanded = current.getAttribute('aria-expanded');
  if (expanded == null) return;

  if (
    event.key === 'ArrowRight' ||
    event.key === 'Enter' ||
    event.key === ' '
  ) {
    if (expanded === 'false') {
      event.preventDefault();
      current
        .querySelector<HTMLButtonElement>('[data-map-layer-group-toggle]')
        ?.click();
    }
  } else if (event.key === 'ArrowLeft' && expanded === 'true') {
    event.preventDefault();
    current
      .querySelector<HTMLButtonElement>('[data-map-layer-group-toggle]')
      ?.click();
  }
}
</script>
<template>
  <div class="layer-control-container">
    <div class="layer-control__search">
      <InputText
        v-model="layerSearch"
        data-map-layer-search
        :data-map-id="mapId"
        :placeholder="trans('map.layer-control.search')"
        aria-label="Search layers"
      />
      <MapControlButton
        v-if="layerSearch.trim()"
        class="layer-control__search-clear"
        title="Clear search"
        @click="layerSearch = ''" variant="plain">
        <SvgIcon size="14" type="mdi" :path="mdiClose" />
      </MapControlButton>
    </div>
    <div v-if="views.length" class="layer-control__header">
      <slot name="title"></slot>
      <div class="v-spacer"></div>
      <ButtonToggleShowALl :items="views" />
      <MapControlButton
        @click="addNewGroup()"
        v-if="!disabledCreateGroup"
        title="Create group"
        variant="plain"
      >
        <SvgIcon size="16" type="mdi" :path="path.group.create" />
      </MapControlButton>
      <MapControlButton
        @click="onRemoveAllLayer"
        v-if="!disabledDeleteAll"
        title="Delete all layers"
        variant="plain"
      >
        <SvgIcon size="16" type="mdi" :path="path.deleteAll" />
      </MapControlButton>
    </div>
    <div
      class="layer-control__list"
      role="tree"
      :aria-label="trans('map.layer-control.title')"
      @keydown="onTreeKeydown"
    >
      <div v-if="!views.length" class="layer-control__empty">
        <SvgIcon
          class="layer-control__empty-icon"
          size="36"
          type="mdi"
          :path="path.icon"
        />
        <div class="layer-control__empty-title">
          {{ trans('map.layer-control.empty') }}
        </div>
        <div v-if="!disabledCreate" class="layer-control__empty-hint">
          {{ trans('map.layer-control.empty-hint') }}
        </div>
        <button
          v-if="!disabledCreate"
          type="button"
          class="layer-control__empty-action"
          @click="emit('create')"
        >
          <SvgIcon size="14" type="mdi" :path="path.layer.create" />
          {{ trans('map.layer-control.create-btn') }}
        </button>
      </div>
      <div v-else-if="debouncedSearch.trim() && !filteredViews.length" class="layer-control__empty">
        <div class="layer-control__empty-title">
          {{ trans('map.layer-control.search-empty') }}
        </div>
      </div>
      <DraggableGroupList
        v-show="views.length && filteredViews.length"
        ref="groupRef"
        v-model:items="views"
        v-model:selected="layers_select"
        :disabled="disabled"
        :disabled-drag="listDisabledDrag"
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
              :searchQuery="debouncedSearch"
              @click="toggleSelect(item)"
              @click:remove="onRemoveLayer"
              :map-id="mapId"
              :readonly="false"
              :disabledMove="disabledMove"
              :disabledCreateGroup="disabledCreateGroup"
              :getGroups="getMenuGroups"
            >
            </RegistryItem>
          </slot>
        </template>
      </DraggableGroupList>
    </div>
  </div>
</template>

