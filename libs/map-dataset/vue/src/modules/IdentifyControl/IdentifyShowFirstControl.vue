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
  isIdentifyAbortError,
  runIdentifyShowFirst,
} from '@hungpvq/map-dataset/identify';
import { defaultMapProps, useEventMap, useMap } from '@hungpvq/vue-map-core';
import { MapMouseEvent } from 'maplibre-gl';
import { onMounted, onUnmounted, ref, watch } from 'vue';

import { useMapDataset } from '../../store/dataset-api';

const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});
const { mapId, callMap } = useMap(props);
const { getAllComponentsByType, datasetVersion } = useMapDataset(mapId);
const views = ref<Array<IIdentifyView & IDataset>>([]);
const loading = ref(false);

let queryAbort: AbortController | null = null;
let queryGeneration = 0;

function refreshViews() {
  views.value =
    getAllComponentsByType<IIdentifyView & IDataset>('identify') || [];
}

watch([datasetVersion, mapId], refreshViews, { immediate: true });

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
  queryAbort?.abort();
  const ac = new AbortController();
  queryAbort = ac;
  const generation = ++queryGeneration;

  setLoading(true);
  try {
    await runIdentifyShowFirst({
      identifies: views.value,
      mapId: mapId.value,
      pointOrBox: e.point,
      event: e,
      signal: ac.signal,
      requestId: generation,
    });
  } catch (error) {
    if (isIdentifyAbortError(error) || ac.signal.aborted) {
      return;
    }
    // Loading cleared in finally; avoid unhandled rejection from void click handler.
  } finally {
    if (queryAbort === ac) {
      queryAbort = null;
    }
    if (generation === queryGeneration) {
      setLoading(false);
    }
  }
}

onMounted(() => {
  addEventClick();
});
onUnmounted(() => {
  removeEventClick();
  queryAbort?.abort();
  queryAbort = null;
  if (loading.value) setLoading(false);
});
</script>
<template>
  <div></div>
</template>
