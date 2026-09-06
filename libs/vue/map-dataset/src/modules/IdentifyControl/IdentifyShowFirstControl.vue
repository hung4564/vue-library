<script lang="ts">
export default {
  name: 'inspect-show-first-control',
};
</script>
<script setup lang="ts">
import {
  EventClick,
  logHelper,
  runMapControlAction,
  WithMapPropType,
} from '@hungpvq/map-core';
import type {
  IDataset,
  IdentifyMultiResult,
  IIdentifyView,
} from '@hungpvq/map-dataset';
import {
  handleMultiIdentifyGetFirst,
  IDENTIFY_CONTROL,
  identifyResolver,
} from '@hungpvq/map-dataset';
import { defaultMapProps, useEventMap, useMap } from '@hungpvq/vue-map-core';
import { MapMouseEvent } from 'maplibre-gl';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { loggerIdentify } from '../../logger';
import { useMapDataset } from '../../store';

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
  logHelper(
    loggerIdentify,
    mapId.value,
    'FIRST',
    'IdentifyShowFirstControl',
  ).debug('onMapClick', { event: e });
  void onGetFeatures(e);
}

function onSelectFeatures(
  record: IdentifyMultiResult | undefined,
  event?: MapMouseEvent,
) {
  logHelper(
    loggerIdentify,
    mapId.value,
    'FIRST',
    'IdentifyShowFirstControl',
  ).debug('onSelectFeatures', { record });
  const records =
    record?.features?.length ? [record] : ([] as IdentifyMultiResult[]);
  identifyResolver
    .execute({
      records,
      mapId: mapId.value,
      event,
      singleLayer: true,
      preferResultControl: !!props.preferResultControl,
    })
    .then((res) =>
      logHelper(
        loggerIdentify,
        mapId.value,
        'FIRST',
        'IdentifyShowFirstControl',
      ).debug('onSelectFeaturesResult', res),
    );
}

async function onGetFeatures(e: MapMouseEvent) {
  if (loading.value) return;
  const loadStartedAt = performance.now();
  setLoading(true);
  logHelper(
    loggerIdentify,
    mapId.value,
    'FIRST',
    'IdentifyShowFirstControl',
  ).info('loading:start', { pointOrBox: e.point });
  try {
    logHelper(
      loggerIdentify,
      mapId.value,
      'FIRST',
      'IdentifyShowFirstControl',
    ).debug('onGetFeatures', { pointOrBox: e.point });
    const record = await handleMultiIdentifyGetFirst(
      views.value,
      mapId.value,
      e.point,
    );
    logHelper(
      loggerIdentify,
      mapId.value,
      'FIRST',
      'IdentifyShowFirstControl',
    ).debug('onGetFeatures', { record });
    onSelectFeatures(record, e);
    logHelper(
      loggerIdentify,
      mapId.value,
      'FIRST',
      'IdentifyShowFirstControl',
    ).info('loading:done', {
      durationMs: Math.round(performance.now() - loadStartedAt),
      featureCount: record?.features?.length ?? 0,
      empty: !record?.features?.length,
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
