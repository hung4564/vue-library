<template>
  <component
    :is="resolvedButton"
    :mapId="mapId"
    :show="allLayerShow"
    :title="titleAll"
    size="medium"
    :iconSize="16"
    @toggle="onClick"
  />
</template>
<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import type { GlobalVisibilityMode, IListViewUI } from '@hungpvq/map-dataset';
import {
  applyAllLayerVisibility,
  notifyMapDatasetStore,
} from '@hungpvq/map-dataset';
import { LIST_VIEW_MENU_COMPONENT_KEY } from '@hungpvq/map-dataset/menu';
import { useLang, useMap, useUniversalRegistry } from '@hungpvq/vue-map-core';
import { type Component, computed, markRaw, watch } from 'vue';

import ToggleShowButton from '../../../extra/component/toggle-show-button.vue';
import { useMapDataset } from '../../../store/dataset-api';

defineOptions({ inheritAttrs: false });

const componentKey = LIST_VIEW_MENU_COMPONENT_KEY.toggleShowButton;
const props = withDefaults(
  defineProps<{
    items: IListViewUI[];
    globalVisibilityMode?: GlobalVisibilityMode;
  }>(),
  {
    globalVisibilityMode: 'sync',
  },
);
const { callMap, mapId } = useMap();
const { trans } = useLang(mapId.value);
const { datasetVersion, getStoreDataset } = useMapDataset(mapId);
const { getComponent } = useUniversalRegistry(mapId.value);

function asRawComponent(comp: Component | undefined) {
  if (!comp || typeof comp !== 'object') return comp;
  return markRaw(comp);
}

const resolvedButton = computed(
  () =>
    asRawComponent(getComponent(componentKey) as Component | undefined) ??
    asRawComponent(ToggleShowButton),
);

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
    applyAllLayerVisibility(
      props.items,
      map,
      value,
      props.globalVisibilityMode,
    );
  });
}

function onClick() {
  onToggleShow(!allLayerShow.value);
}

watch(
  () => props.items,
  (items) => {
    if (props.globalVisibilityMode !== 'override') return;
    if (allLayerShow.value) return;
    callMap((map: MapSimple) => {
      applyAllLayerVisibility(items, map, false, 'override');
    });
  },
);
</script>
