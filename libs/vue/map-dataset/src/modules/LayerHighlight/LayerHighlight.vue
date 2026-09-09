<template>
  <div></div>
</template>
<script setup lang="ts">
import {
  logHelper,
  type MapSimple,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { EventClick, EventMouseMove } from '@hungpvq/map-core/event';
import type {
  HighlightHandle,
  IdentifyMultiResult,
  IHighlightView,
} from '@hungpvq/map-dataset';
import {
  convertItemToFeature,
  findSiblingOrNearestLeaf,
  handleMultiIdentifyGetFirst,
} from '@hungpvq/map-dataset';
import { defaultMapProps, useEventMap, useMap } from '@hungpvq/vue-map-core';
import type { Feature, FeatureCollection } from 'geojson';
import type { GeoJSONFeature, MapMouseEvent, PointLike } from 'maplibre-gl';
import { onUnmounted, shallowRef, watch } from 'vue';
import { loggerHighlight } from '../../logger';
import { useMapDataset } from '../../store';
import { useMapDatasetHighlight } from '../../store/highlight';
import { useDefaultHighlight } from './helper';

const props = withDefaults(
  defineProps<
    WithMapPropType & {
      durationMs?: number;
      color?: string;
      enableClick?: boolean;
      enableHover?: boolean;
    }
  >(),
  {
    ...defaultMapProps,
    durationMs: 5000,
    color: '#004E98',
  },
);
const { mapId, callMap } = useMap(props, undefined, onRemoveMap);
const { getAllComponentsByType } = useMapDataset(mapId.value);
const { add: addEventClick, remove: removeEventClick } = useEventMap(
  mapId.value,
  new EventClick().setHandler(onMapClick),
);
const { add: addEventHover, remove: removeEventHover } = useEventMap(
  mapId.value,
  new EventMouseMove().setClassPointer('').setHandler(onMapHover),
);
const {
  getFeatureHighlight,
  setFeatureHighlight,
  getDatesetHighlight,
  getHighlightSource,
} = useMapDatasetHighlight(mapId.value);

let clickRequestId = 0;
let hoverRequestId = 0;
let lastHoverId: string | undefined;

watch(
  () => props.enableClick,
  (enabled) => {
    if (enabled) addEventClick();
    else removeEventClick();
  },
  { immediate: true },
);
watch(
  () => props.enableHover,
  (enabled) => {
    if (enabled) addEventHover();
    else removeEventHover();
  },
  { immediate: true },
);
onUnmounted(() => {
  removeEventClick();
  removeEventHover();
});

function featureIdentity(data?: Record<string, unknown>) {
  if (!data) return undefined;
  const id = data.id;
  return id != null ? String(id) : undefined;
}

function onMapClick(e: MapMouseEvent) {
  logHelper(loggerHighlight, mapId.value, 'LayerHighlight').debug(
    'onMapClick',
    e,
  );
  const current = ++clickRequestId;
  hoverRequestId += 1;
  lastHoverId = undefined;
  callMap((map) => {
    stopAnimation(map);
  });
  onGetFeatures(e.point, current, 'highlight');
}

function onMapHover(e: MapMouseEvent) {
  if (!props.enableHover) return;
  const current = ++hoverRequestId;
  onGetFeatures(e.point, current, 'hover');
}

async function onGetFeatures(
  pointOrBox: PointLike | [PointLike, PointLike] | undefined,
  current: number,
  source: 'highlight' | 'hover',
) {
  const record: IdentifyMultiResult | undefined =
    await handleMultiIdentifyGetFirst(
      (getAllComponentsByType<IHighlightView>('highlight') || []) as any[],
      mapId.value,
      pointOrBox,
    );
  if (source === 'highlight' && current !== clickRequestId) return;
  if (source === 'hover' && current !== hoverRequestId) return;
  logHelper(loggerHighlight, mapId.value, 'LayerHighlight').debug(
    'onGetFeatures',
    record,
  );
  const item = record?.features?.[0];
  const data = item?.data as
    | { id?: string | number; geometry: Feature['geometry']; [key: string]: unknown }
    | undefined;
  if (!data?.geometry) {
    if (source === 'hover') {
      lastHoverId = undefined;
      if (getHighlightSource()?.value === 'hover') {
        setFeatureHighlight(undefined, 'hover', undefined);
      }
      return;
    }
    setFeatureHighlight(undefined, 'highlight', undefined);
    return;
  }
  if (source === 'hover') {
    const id = featureIdentity(data);
    if (id && id === lastHoverId && getHighlightSource()?.value === 'hover') {
      return;
    }
    lastHoverId = id;
  }
  setFeatureHighlight(
    convertItemToFeature(data),
    source,
    record?.identify,
  );
}
function onRemoveMap(map: MapSimple) {
  stopAnimation(map);
}

const handleHighligh = shallowRef<HighlightHandle | undefined>();
const handleDefault = useDefaultHighlight(props.color);
function updateHighlight(geojsonData?: Feature | FeatureCollection | GeoJSONFeature) {
  const durationMs = props.durationMs;
  logHelper(loggerHighlight, mapId.value, 'LayerHighlight').debug(
    'updateHighlight',
    'geojsonData',
    geojsonData,
  );
  if (!geojsonData) {
    return;
  }
  const dataset = getDatesetHighlight();
  let highlightView: IHighlightView | undefined = undefined;
  if (dataset) {
    highlightView = findSiblingOrNearestLeaf(
      dataset,
      (dataset) => dataset.type == 'highlight',
    ) as unknown as IHighlightView;
  }

  logHelper(loggerHighlight, mapId.value, 'LayerHighlight').debug(
    'updateHighlight',
    'highlightView',
    highlightView,
  );
  callMap((map: MapSimple) => {
    stopAnimation(map);
    handleHighligh.value = handleDefault;
    handleDefault.setDataset(highlightView);
    if (
      highlightView &&
      'startAnimation' in highlightView &&
      'stopAnimation' in highlightView
    ) {
      handleHighligh.value = highlightView;
      logHelper(loggerHighlight, mapId.value, 'LayerHighlight').debug(
        'updateHighlight',
        'use handle highlight of highlight dataset',
      );
    } else {
      logHelper(loggerHighlight, mapId.value, 'LayerHighlight').debug(
        'updateHighlight',
        'use handle default',
      );
    }
    logHelper(loggerHighlight, mapId.value, 'LayerHighlight').debug('start', {
      map,
      feature: geojsonData,
      durationMs,
      handleHighligh: handleHighligh.value,
    });
    handleHighligh.value.setOnDone(map, () => {
      clear();
    });
    handleHighligh.value.startAnimation({
      map,
      feature: geojsonData,
      durationMs,
    });
  });
}

watch(
  () => getFeatureHighlight()?.value,
  (value) => {
    if (!value) {
      callMap((map) => {
        stopAnimation(map);
      });
      return;
    }
    updateHighlight(value);
  },
);

function stopAnimation(map: MapSimple) {
  handleHighligh.value?.stopAnimation(map);
  handleDefault.stopAnimation(map);
  logHelper(loggerHighlight, mapId.value, 'LayerHighlight').debug('done', {
    handleHighligh: handleHighligh.value,
  });
}
function clear() {
  setFeatureHighlight(undefined, '', undefined);
}
</script>
