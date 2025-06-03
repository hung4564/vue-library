<script setup lang="ts">
import {
  EventClick,
  useEventMap,
  useMap,
  withMapProps,
} from '@hungpvq/vue-map-core';
import { MapMouseEvent, type PointLike } from 'maplibre-gl';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import type { IDataset } from '../../interfaces/dataset.base';
import type { IIdentifyView, MenuAction } from '../../interfaces/dataset.parts';
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
  onGetFeatures(e.point);
}
const result = reactive<{
  items: { identify: IIdentifyView & IDataset; features: any[] }[];
  loading: boolean;
}>({
  items: [],
  loading: false,
});
function onSelectFeatures(feature: {
  identify: IIdentifyView & IDataset;
  features: any[];
}) {
  if (feature && feature.features && feature.features[0]) {
    const menu = feature.identify.getMenu('show-detail');
    if (menu) onMenuAction(feature.identify, menu, feature.features[0].data);
  }
}
const cUsedIdentify = computed(() => {
  return views.value;
});
async function onGetFeatures(pointOrBox?: PointLike | [PointLike, PointLike]) {
  result.loading = true;
  try {
    const feature = await handleMultiIdentifyGetFirst(
      cUsedIdentify.value,
      mapId.value,
      pointOrBox,
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
