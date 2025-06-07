<script setup lang="ts">
import { logHelper } from '@hungpvq/shared-map';
import {
  EventClick,
  useEventMap,
  useMap,
  withMapProps,
} from '@hungpvq/vue-map-core';
import { MapMouseEvent, type PointLike } from 'maplibre-gl';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import type { IDataset } from '../../interfaces/dataset.base';
import type {
  IdentifyResult,
  IIdentifyView,
  MenuAction,
} from '../../interfaces/dataset.parts';
import { loggerIdentify } from '../../logger';
import { handleMultiIdentifyGetFirst } from '../../model';
import { handleMenuAction } from '../../model/menu';
import { useMapDataset } from '../../store';
const props = defineProps({
  ...withMapProps,
});
const { mapId } = useMap(props);
const { getAllComponentsByType, getDatasetIds } = useMapDataset(mapId.value);
const views = ref<Array<IIdentifyView & IDataset>>([]);
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
function updateList() {
  getViewFromStore();
}
function getViewFromStore() {
  views.value =
    getAllComponentsByType<IIdentifyView & IDataset>('identify') || [];
}
const {
  add: addEventClick,
  remove: removeEventClick,
  isActive: isEventClickActive,
} = useEventMap(mapId.value, new EventClick().setHandler(onMapClick));

function onMapClick(e: MapMouseEvent) {
  logHelper(loggerIdentify, mapId.value, 'getFirst').debug('onMapClick', e);
  onGetFeatures(e.point);
}
logHelper(loggerIdentify, mapId.value, 'getFirst').debug('init');
const result = reactive<{
  items: { identify: IIdentifyView & IDataset; features: any[] }[];
  loading: boolean;
}>({
  items: [],
  loading: false,
});
function onSelectFeatures(feature: IdentifyResult) {
  logHelper(loggerIdentify, mapId.value, 'getFirst').debug(
    'onSelectFeatures',
    feature,
  );
  if (feature && 'feature' in feature && feature.feature) {
    const menu = feature.identify.getMenu('show-detail');
    logHelper(loggerIdentify, mapId.value, 'getFirst').debug(
      'onSelectFeatures',
      feature,
      menu,
    );
    if (menu) onMenuAction(feature.identify, menu as any, feature.feature.data);
  }
}
const cUsedIdentify = computed(() => {
  return views.value;
});
async function onGetFeatures(pointOrBox?: PointLike | [PointLike, PointLike]) {
  logHelper(loggerIdentify, mapId.value, 'getFirst').debug(
    'onGetFeatures',
    pointOrBox,
  );
  result.loading = true;
  try {
    const feature = await handleMultiIdentifyGetFirst(
      cUsedIdentify.value,
      mapId.value,
      pointOrBox,
    );
    logHelper(loggerIdentify, mapId.value, 'getFirst').debug(
      'onGetFeatures',
      feature,
    );
    onSelectFeatures(feature);
  } finally {
    result.loading = false;
  }
}

function onMenuAction(
  identify: IIdentifyView & IDataset,
  menu: MenuAction<IIdentifyView & IDataset>,
  item: any,
) {
  handleMenuAction(menu, identify, mapId.value, item);
}
onMounted(() => {
  addEventClick();
});
</script>
<template>
  <div></div>
</template>
