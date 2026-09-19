<script setup lang="ts">
import type { MapSimple, WithMapPropType } from '@hungpvq/map-core';
import { fitBounds } from '@hungpvq/map-core';
import { addListViewsToGroup, addListViewsToNewGroup, canMoveListView, type IListViewUI, moveListView, syncListViewLayerOrder } from '@hungpvq/map-dataset';
import { LIST_VIEW_MENU_ID, MenuClickAddComponent, MenuClickFitBounds, MenuClickHighlight, MenuItemProps } from '@hungpvq/map-dataset/menu';
import {
  defaultMapProps,
  UniversalRegistry,
  useMap,
} from '@hungpvq/vue-map-core';
import { onUnmounted } from 'vue';
import { useMapDataset } from '../store/dataset-api';
import { useMapDatasetComponent } from '../store/component';
import { useMapHighlight } from '../store/highlight';
import { notifyMapDatasetStore } from '@hungpvq/map-dataset';

const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});
const { mapId, callMap } = useMap(props);
const { addComponent } = useMapDatasetComponent(mapId.value);
const hl = useMapHighlight(mapId.value);
const { getAllComponentsByType, getStoreDataset } = useMapDataset(mapId.value);

const MENU_HANDLER_KEYS = [
  LIST_VIEW_MENU_ID.addComponent,
  LIST_VIEW_MENU_ID.fitBounds,
  LIST_VIEW_MENU_ID.highlight,
  LIST_VIEW_MENU_ID.layer.addToGroup,
  LIST_VIEW_MENU_ID.layer.addToExistingGroup,
  LIST_VIEW_MENU_ID.layer.moveUp,
  LIST_VIEW_MENU_ID.layer.moveDown,
] as const;

function refreshList() {
  const store = getStoreDataset();
  if (store) notifyMapDatasetStore(store);
}

function runAddToGroup({ layer }: MenuItemProps) {
  const next = addListViewsToNewGroup(
    getAllComponentsByType<IListViewUI>('list'),
    [layer.id],
  );
  callMap((map: MapSimple) => syncListViewLayerOrder(map, next));
  refreshList();
}

function runAddToExistingGroup({ layer, meta }: MenuItemProps) {
  const groupId = typeof meta?.groupId === 'string' ? meta.groupId : undefined;
  const groupName =
    typeof meta?.groupName === 'string' && meta.groupName
      ? meta.groupName
      : 'New Group';
  if (!groupId) return;
  const next = addListViewsToGroup(
    getAllComponentsByType<IListViewUI>('list'),
    [layer.id],
    { id: groupId, name: groupName },
  );
  callMap((map: MapSimple) => syncListViewLayerOrder(map, next));
  refreshList();
}

function runMove(direction: 'up' | 'down') {
  return ({ layer }: MenuItemProps) => {
    const views = getAllComponentsByType<IListViewUI>('list');
    if (!canMoveListView(views, layer.id, direction)) return;
    const next = moveListView(views, layer.id, direction);
    callMap((map: MapSimple) => syncListViewLayerOrder(map, next));
    refreshList();
  };
}

UniversalRegistry.registerMenuHandlerForMap(
  mapId.value,
  LIST_VIEW_MENU_ID.addComponent,
  ({ value }: MenuItemProps<MenuClickAddComponent>) => {
    if (value) addComponent(value);
  },
);
UniversalRegistry.registerMenuHandlerForMap(
  mapId.value,
  LIST_VIEW_MENU_ID.fitBounds,
  ({ value }: MenuItemProps<MenuClickFitBounds | unknown>) => {
    callMap((map) => {
      const target =
        value &&
        typeof value === 'object' &&
        'detail' in value &&
        (value as MenuClickFitBounds).detail != null
          ? (value as MenuClickFitBounds).detail
          : value;
      if (target) fitBounds(map, target as never);
    });
  },
);
UniversalRegistry.registerMenuHandlerForMap(
  mapId.value,
  LIST_VIEW_MENU_ID.highlight,
  ({ value, layer }: MenuItemProps<MenuClickHighlight>) => {
    if (value) {
      return hl.show(value.detail, {
        source: value.key,
        dataset: layer,
      });
    }
  },
);
UniversalRegistry.registerMenuHandlerForMap(
  mapId.value,
  LIST_VIEW_MENU_ID.layer.addToGroup,
  runAddToGroup,
);
UniversalRegistry.registerMenuHandlerForMap(
  mapId.value,
  LIST_VIEW_MENU_ID.layer.addToExistingGroup,
  runAddToExistingGroup,
);
UniversalRegistry.registerMenuHandlerForMap(
  mapId.value,
  LIST_VIEW_MENU_ID.layer.moveUp,
  runMove('up'),
);
UniversalRegistry.registerMenuHandlerForMap(
  mapId.value,
  LIST_VIEW_MENU_ID.layer.moveDown,
  runMove('down'),
);

onUnmounted(() => {
  for (const key of MENU_HANDLER_KEYS) {
    UniversalRegistry.unregisterMenuHandlerForMap(mapId.value, key);
  }
});
</script>
<template>
  <div></div>
</template>
