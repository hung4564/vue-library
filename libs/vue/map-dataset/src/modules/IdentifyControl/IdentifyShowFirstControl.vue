<script lang="ts">
export default {
  name: 'inspect-show-first-control',
};
</script>
<script setup lang="ts">
import { runMapControlAction, WithMapPropType } from '@hungpvq/map-core';
import { EventClick } from '@hungpvq/map-core/event';
import type { IDataset } from '@hungpvq/map-dataset';
import type { IIdentifyView } from '@hungpvq/map-dataset/identify';
import {
  IDENTIFY_CONTROL,
  runIdentifyShowFirst,
} from '@hungpvq/map-dataset/identify';
import { defaultMapProps, useEventMap, useMap } from '@hungpvq/vue-map-core';
import { MapMouseEvent } from 'maplibre-gl';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useMapDataset } from '../../store/dataset-api';

const props = withDefaults(
  defineProps<
    WithMapPropType & {
      /**
       * Always open Identify Result panel (skip auto show-detail / attribute-table).
       */
      preferResultControl?: boolean;
    }
  >(),
  {
    ...defaultMapProps,
    preferResultControl: false,
  },
);
const { mapId, callMap } = useMap(props);
const { getAllComponentsByType, getDatasetIds } = useMapDataset(mapId.value);
const views = ref<Array<IIdentifyView & IDataset>>([]);
const loading = ref(false);

function refreshViews() {
  views.value =
    getAllComponentsByType<IIdentifyView & IDataset>('identify') || [];
}

watch(getDatasetIds(), refreshViews, { deep: true, immediate: true });

const { add: addEventClick, remove: removeEventClick } = useEventMap(
  mapId.value,
  new EventClick().setHandler(onMapClick),
);

function setLoading(value: boolean) {
  loading.value = value;
  callMap((map) => {
    map.getCanvas().style.cursor = value ? 'wait' : '';
  });
  // Sync IdentifyControl toolbar spinner when both are mounted.
  runMapControlAction(
    mapId.value,
    IDENTIFY_CONTROL.id,
    IDENTIFY_CONTROL.actionSetLoading,
    value,
  );
}

function onMapClick(e: MapMouseEvent) {
  void onGetFeatures(e);
}

async function onGetFeatures(e: MapMouseEvent) {
  if (loading.value) return;
  setLoading(true);
  try {
    await runIdentifyShowFirst({
      identifies: views.value,
      mapId: mapId.value,
      pointOrBox: e.point,
      event: e,
      preferResultControl: !!props.preferResultControl,
    });
  } finally {
    setLoading(false);
  }
}

onMounted(() => {
  addEventClick();
});
onUnmounted(() => {
  removeEventClick();
  if (loading.value) setLoading(false);
});
</script>
<template>
  <div></div>
</template>
