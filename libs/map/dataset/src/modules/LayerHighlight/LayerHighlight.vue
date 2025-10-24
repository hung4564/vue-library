<template>
  <div></div>
</template>
<script setup lang="ts">
import { logHelper, type MapSimple } from '@hungpvq/shared-map';
import {
  defaultMapProps,
  EventClick,
  useEventMap,
  useMap,
  type WithMapPropType,
} from '@hungpvq/vue-map-core';
import type { Feature } from 'geojson';
import type { GeoJSONFeature, MapMouseEvent, PointLike } from 'maplibre-gl';
import { onMounted, onUnmounted, shallowRef, watch } from 'vue';
import type { IdentifySingleResult } from '../../interfaces';
import { loggerHighlight } from '../../logger';
import type { HighlightHandle, IHighlightView } from '../../model';
import {
  findSiblingOrNearestLeaf,
  handleMultiIdentifyGetFirst,
} from '../../model';
import { useMapDataset } from '../../store';
import { useMapDatasetHighlight } from '../../store/highlight';
import { useDefaultHighlight } from './helper';

const props = withDefaults(
  defineProps<
    WithMapPropType & {
      durationMs?: number;
      color?: string;
      enableClick?: boolean;
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
const { getFeatureHighlight, setFeatureHighlight, getDatesetHighlight } =
  useMapDatasetHighlight(mapId.value);

onMounted(() => {
  if (props.enableClick) addEventClick();
});
onUnmounted(() => {
  removeEventClick();
});
function onMapClick(e: MapMouseEvent) {
  logHelper(loggerHighlight, mapId.value, 'LayerHighlight').debug(
    'onMapClick',
    e,
  );
  onGetFeatures(e.point);
}
async function onGetFeatures(pointOrBox?: PointLike | [PointLike, PointLike]) {
  const feature: IdentifySingleResult = await handleMultiIdentifyGetFirst(
    (getAllComponentsByType<IHighlightView>('highlight') || []) as any[],
    mapId.value,
    pointOrBox,
  );
  logHelper(loggerHighlight, mapId.value, 'LayerHighlight').debug(
    'onGetFeatures',
    feature,
  );
  setFeatureHighlight(feature.feature.data, 'highlight', feature.identify);
}
function onRemoveMap(map: MapSimple) {
  stopAnimation(map);
}

const handleHighligh = shallowRef<HighlightHandle | undefined>();
const handleDefault = useDefaultHighlight(props.color);
function updateHighlight(geojsonData?: Feature | GeoJSONFeature) {
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
  () => getFeatureHighlight()?.value, // đây là cái Vue thực sự theo dõi
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
  if (!handleHighligh.value) {
    return;
  }
  handleHighligh.value.stopAnimation(map);
  logHelper(loggerHighlight, mapId.value, 'LayerHighlight').debug('done', {
    handleHighligh: handleHighligh.value,
  });
}
function clear() {
  setFeatureHighlight(undefined, '', undefined);
}
</script>
