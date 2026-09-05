<script setup lang="ts">
import type { MapSimple, WithMapPropType } from '@hungpvq/map-core';
import { fitBounds } from '@hungpvq/map-core';
import {
  addListViewsToGroup,
  addListViewsToNewGroup,
  canMoveListView,
  type IListViewUI,
  LIST_VIEW_MENU_ID,
  MenuClickAddComponent,
  MenuClickFitBounds,
  MenuClickHighlight,
  MenuItemProps,
  moveListView,
  syncListViewLayerOrder,
} from '@hungpvq/map-dataset';
import {
  defaultMapProps,
  UniversalRegistry,
  useMap,
} from '@hungpvq/vue-map-core';
import {
  useMapDataset,
  useMapDatasetComponent,
  useMapDatasetHighlight,
} from '../store';

const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});
const { mapId, callMap } = useMap(props);
const { addComponent } = useMapDatasetComponent(mapId.value);
const { setFeatureHighlight } = useMapDatasetHighlight(mapId.value);
const { getAllComponentsByType, getStoreDataset } = useMapDataset(mapId.value);

function refreshList() {
  const store = getStoreDataset();
  if (store) store.datasetIds.value = [...store.datasetIds.value];
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
  'addComponent',
  ({ value }: MenuItemProps<MenuClickAddComponent>) => {
    if (value) addComponent(value);
  },
);
UniversalRegistry.registerMenuHandlerForMap(
  mapId.value,
  'fitBounds',
  ({ value }: MenuItemProps<MenuClickFitBounds>) => {
    callMap((map) => {
      fitBounds(map, value?.detail);
    });
  },
);
UniversalRegistry.registerMenuHandlerForMap(
  mapId.value,
  'highlight',
  ({ value, layer }: MenuItemProps<MenuClickHighlight>) => {
    if (value) setFeatureHighlight(value.detail, value.key, layer);
  },
);
UniversalRegistry.registerMenuHandlerForMap(
  mapId.value,
  LIST_VIEW_MENU_ID.addToGroup,
  runAddToGroup,
);
UniversalRegistry.registerMenuHandlerForMap(
  mapId.value,
  LIST_VIEW_MENU_ID.addToExistingGroup,
  runAddToExistingGroup,
);
UniversalRegistry.registerMenuHandlerForMap(
  mapId.value,
  LIST_VIEW_MENU_ID.moveUp,
  runMove('up'),
);
UniversalRegistry.registerMenuHandlerForMap(
  mapId.value,
  LIST_VIEW_MENU_ID.moveDown,
  runMove('down'),
);
</script>
<template>
  <div></div>
</template>
