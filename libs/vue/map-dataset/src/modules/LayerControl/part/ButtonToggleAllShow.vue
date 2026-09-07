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
  LAYER_CONTROL_LOCALE,
  LIST_VIEW_MENU_COMPONENT_KEY,
} from '@hungpvq/map-dataset';
import { RegistryItem, useLang, useMap } from '@hungpvq/vue-map-core';
import { computed, watch } from 'vue';
import ToggleShowButton from '../../../extra/component/toggle-show-button.vue';
import { useMapDatasetStore } from '../../../store';

defineOptions({ inheritAttrs: false });

const componentKey = LIST_VIEW_MENU_COMPONENT_KEY.toggleShowButton;
const props = defineProps<{
  items: IListViewUI[];
}>();
const { callMap, mapId } = useMap();
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault(LAYER_CONTROL_LOCALE);
const store = useMapDatasetStore(mapId.value);
const allLayerShow = store.allLayerShow;

const titleAll = computed(() =>
  trans.value(
    allLayerShow.value
      ? 'map.layer-control.toggle.hide-all'
      : 'map.layer-control.toggle.show-all',
  ),
);

function onToggleShow(value: boolean) {
  allLayerShow.value = value;
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
    if (!allLayerShow.value) {
      callMap((map: MapSimple) => {
        applyGlobalLayerVisibility(items, map, false);
      });
    }
  },
);
</script>
