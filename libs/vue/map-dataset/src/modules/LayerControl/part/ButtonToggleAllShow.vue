<template>
  <RegistryItem
    :componentKey="componentKey"
    :defaultComponent="ToggleShowButton"
    :mapId="mapId"
    :show="allLayerShow"
    :title="titleAll"
    v-bind="$attrs"
    @toggle="onClick"
  />
</template>
<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import type { IListViewUI } from '@hungpvq/map-dataset';
import {
  applyGlobalLayerVisibility,
  notifyMapDatasetStore,
} from '@hungpvq/map-dataset';
import { LIST_VIEW_MENU_COMPONENT_KEY } from '@hungpvq/map-dataset/menu';
import { RegistryItem, useLang, useMap } from '@hungpvq/vue-map-core';
import { computed, watch } from 'vue';
import ToggleShowButton from '../../../extra/component/toggle-show-button.vue';
import { useMapDataset } from '../../../store/dataset-api';

defineOptions({ inheritAttrs: false });

const componentKey = LIST_VIEW_MENU_COMPONENT_KEY.toggleShowButton;
const props = defineProps<{
  items: IListViewUI[];
}>();
const { callMap, mapId } = useMap();
const { trans } = useLang(mapId.value);
const { datasetVersion, getStoreDataset } = useMapDataset(mapId);

const allLayerShow = computed(() => {
  void datasetVersion.value;
  return getStoreDataset()?.allLayerShow !== false;
});

const titleAll = computed(() =>
  trans.value(
    allLayerShow.value
      ? 'map.layer-control.toggle.hide-all'
      : 'map.layer-control.toggle.show-all',
  ),
);

function onToggleShow(value: boolean) {
  const store = getStoreDataset();
  if (!store) return;
  store.allLayerShow = value;
  notifyMapDatasetStore(store);
  callMap((map: MapSimple) => {
    applyGlobalLayerVisibility(props.items, map, value);
  });
}

function onClick() {
  onToggleShow(!allLayerShow.value);
}

watch(
  () => props.items,
  (items) => {
    if (allLayerShow.value) return;
    callMap((map: MapSimple) => {
      applyGlobalLayerVisibility(items, map, false);
    });
  },
);
</script>
