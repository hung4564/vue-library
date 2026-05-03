<script lang="ts">
export default {
  name: 'inspect-show-first-control',
};
</script>
<script setup lang="ts">
import { EventClick, logHelper, WithMapPropType } from '@hungpvq/map-core';
import type {
  IDataset,
  IdentifyResult,
  IIdentifyView,
  MenuAction,
} from '@hungpvq/map-dataset';
import {
  convertFeatureToItem,
  handleMenuAction,
  handleMultiIdentifyGetFirst,
} from '@hungpvq/map-dataset';
import { defaultMapProps, useEventMap, useMap } from '@hungpvq/vue-map-core';
import { MapMouseEvent, type PointLike } from 'maplibre-gl';
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { loggerIdentify } from '../../logger';
import { useMapDataset } from '../../store';
const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
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
const { add: addEventClick, remove: removeEventClick } = useEventMap(
  mapId.value,
  new EventClick().setHandler(onMapClick),
);

function onMapClick(e: MapMouseEvent) {
  logHelper(
    loggerIdentify,
    mapId.value,
    'FIRST',
    'IdentifyShowFirstControl',
  ).debug('onMapClick', { event: e });
  onGetFeatures(e);
}
logHelper(
  loggerIdentify,
  mapId.value,
  'FIRST',
  'IdentifyShowFirstControl',
).debug('init');
const result = reactive<{
  loading: boolean;
}>({
  loading: false,
});
function onSelectFeatures(feature: IdentifyResult, event?: MapMouseEvent) {
  logHelper(
    loggerIdentify,
    mapId.value,
    'FIRST',
    'IdentifyShowFirstControl',
  ).debug('onSelectFeatures', { feature });
  if (feature && 'feature' in feature && feature.feature) {
    const menu = feature.identify.getMenu('show-detail');
    logHelper(
      loggerIdentify,
      mapId.value,
      'FIRST',
      'IdentifyShowFirstControl',
    ).debug('onSelectFeatures', { feature, menu });
    if (menu) {
      logHelper(
        loggerIdentify,
        mapId.value,
        'FIRST',
        'IdentifyShowFirstControl',
      ).debug('onSelectFeatures', 'use menu');
      onMenuAction(
        feature.identify,
        menu as any,
        convertFeatureToItem(feature.feature.data),
        event,
      );
    } else if (feature.identify.showDetail) {
      logHelper(
        loggerIdentify,
        mapId.value,
        'FIRST',
        'IdentifyShowFirstControl',
      ).debug('onSelectFeatures', 'use show detail');
      feature.identify.showDetail(mapId.value, feature.feature.data);
    }
  }
}
const cUsedIdentify = computed(() => {
  return views.value;
});
async function onGetFeatures(e: MapMouseEvent) {
  const pointOrBox = e.point;
  logHelper(
    loggerIdentify,
    mapId.value,
    'FIRST',
    'IdentifyShowFirstControl',
  ).debug('onGetFeatures', { pointOrBox });
  result.loading = true;
  try {
    const feature = await handleMultiIdentifyGetFirst(
      cUsedIdentify.value,
      mapId.value,
      pointOrBox,
    );
    logHelper(
      loggerIdentify,
      mapId.value,
      'FIRST',
      'IdentifyShowFirstControl',
    ).debug('onGetFeatures', { feature });
    onSelectFeatures(feature, e);
  } finally {
    result.loading = false;
  }
}

function onMenuAction(
  identify: IIdentifyView & IDataset,
  menu: MenuAction<IIdentifyView & IDataset>,
  item: any,
  event?: MapMouseEvent | MouseEvent,
) {
  handleMenuAction(menu, {
    event,
    layer: identify,
    mapId: mapId.value,
    value: item,
  });
}
onMounted(() => {
  addEventClick();
});
onUnmounted(() => {
  removeEventClick();
});
</script>
<template>
  <div></div>
</template>
