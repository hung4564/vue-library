<template>
  <div></div>
</template>

<script setup lang="ts">
import { mergeFilters, type MapSimple } from '@hungpvq/shared-map';
import {
  defaultMapProps,
  useMap,
  WithMapPropType,
} from '@hungpvq/vue-map-core';
import type {
  CircleLayerSpecification,
  FillLayerSpecification,
  GeoJSONFeature,
  GeoJSONSource,
  LayerSpecification,
  LineLayerSpecification,
} from 'maplibre-gl';
import { computed, ref, toRaw, watch } from 'vue';
import {
  findSiblingOrNearestLeaf,
  IHighlightView,
  ISimpleHighlightView,
} from '../../model';
import { useMapDatasetHighlight } from '../../store/highlight';

const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});

const sourceId = 'source-highlighted';
const layerId = 'layer-highlighted';
type LayerKey = 'point' | 'line' | 'polygon';

const layerIds = ref<Record<LayerKey, string>>({
  point: `${layerId}-point`,
  line: `${layerId}-line`,
  polygon: `${layerId}-polygon`,
});

const layers = ref<
  Record<
    LayerKey,
    Partial<
      FillLayerSpecification | LineLayerSpecification | CircleLayerSpecification
    >
  >
>({
  point: {
    type: 'circle',
    filter: ['==', '$type', 'Point'],
    paint: {
      'circle-radius': 6,
      'circle-color': '#004E98',
      'circle-opacity': 0.7,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff',
    },
  },
  line: {
    type: 'line',
    filter: ['==', '$type', 'LineString'],
    paint: {
      'line-color': '#004E98',
      'line-width': 4,
      'line-dasharray': [2, 4],
    },
  },
  polygon: {
    type: 'fill',
    filter: ['==', '$type', 'Polygon'],
    paint: {
      'fill-color': '#004E98',
      'fill-opacity': 0.4,
    },
  },
});

const { mapId, callMap } = useMap(props, onInitMap, onRemoveMap);
const { getFeatureHighlight, setFeatureHighlight, getDatesetHighlight } =
  useMapDatasetHighlight(mapId.value);

function onInitMap(map: MapSimple) {
  map.addSource(sourceId, {
    type: 'geojson',
    data: {
      type: 'FeatureCollection' as const,
      features: [],
    },
  });
  (Object.keys(layerIds.value) as LayerKey[]).forEach((key) => {
    const layerId = layerIds.value[key];
    if (!map.getLayer(layerId)) {
      map.addLayer({
        ...((layers.value as any)[key] as Partial<LayerSpecification>),
        id: layerId,
        source: sourceId,
      } as LayerSpecification);
    }
  });
}

function onRemoveMap(map: MapSimple) {
  highlightViewStopAnimation && highlightViewStopAnimation();
  Object.values(layerIds.value).forEach((id) => {
    if (map.getLayer(id)) {
      map.removeLayer(id);
    }
  });
  if (map.getSource(sourceId)) {
    map.removeSource(sourceId);
  }
}

const storeFeature = computed(() => getFeatureHighlight());

const updateLayer = (
  map: MapSimple,
  highlightView?: ISimpleHighlightView,
  geojsonData?: GeoJSONFeature,
) => {
  (Object.keys(layerIds.value) as LayerKey[]).forEach((key) => {
    const layerId = layerIds.value[key];
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
    const oldLayer = toRaw((layers.value as any)[key]) as any;
    const newLayer = highlightView?.highlight(geojsonData) || {};
    map.addLayer({
      ...oldLayer,
      id: layerId,
      source: sourceId,
      ...newLayer,
      filter: mergeFilters(oldLayer.filter, newLayer.filter),
    } as any);
  });
};

const updateSource = (map: MapSimple, geojsonData?: GeoJSONFeature) => {
  const source = map.getSource(sourceId) as GeoJSONSource;
  if (source) {
    source.setData(
      geojsonData || {
        type: 'FeatureCollection' as const,
        features: [],
      },
    );
  }
};

const animationClearFrameId = ref<Record<string, any>>({});
const animationFrameId = ref<Record<string, number | null>>({});

const highlight = (map: MapSimple, durationMs = 5000) => {
  Object.values(layerIds.value).forEach((id) => {
    if (map.getLayer(id)) {
      map.moveLayer(id);
    }
  });
  startAnimation(map);
  console.log('durationMs', durationMs);
  if (durationMs > 0) {
    clearTimeout(animationClearFrameId.value[map.id]);
    animationClearFrameId.value[map.id] = setTimeout(() => {
      stopAnimation(map);
      clear();
    }, durationMs);
  }
};

let highlightViewStopAnimation: (() => void) | undefined;
function updateHighlight(geojsonData?: GeoJSONFeature) {
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

  callMap((map: MapSimple) => {
    highlightViewStopAnimation && highlightViewStopAnimation();
    if (highlightView && 'handleHighlight' in highlightView) {
      highlightViewStopAnimation = () => {
        highlightView.stopAnimation(map);
        clear();
      };
      highlightView.handleHighlight(map, geojsonData, 5000);
    } else {
      highlightViewStopAnimation = () => {
        stopAnimation(map);
        clear();
      };
      updateLayer(map, highlightView, geojsonData);
      updateSource(map, geojsonData);
      if (geojsonData) highlight(map);
    }
  });
}

watch(
  storeFeature,
  () => {
    updateHighlight(storeFeature.value?.value);
  },
  { deep: true },
);

// ==== Animation ====
let radius = 6;
let grow = true;
let dashOffset = 0;
let blinkAlpha = 0.4;
let blinkDir = 1;

function animate(map: MapSimple) {
  // Circle pulse
  radius += grow ? 0.2 : -0.2;
  if (radius >= 12) grow = false;
  if (radius <= 6) grow = true;
  map.setPaintProperty(layerIds.value.point, 'circle-radius', radius);

  // Line dash offset
  dashOffset += 0.1;
  dashOffset = +dashOffset.toFixed(1);
  if (dashOffset >= 6) dashOffset = 0;
  const animatedDash = [2 + dashOffset, 4 + dashOffset];
  map.setPaintProperty(layerIds.value.line, 'line-dasharray', animatedDash);

  // Polygon blink
  blinkAlpha += blinkDir * 0.05;
  if (blinkAlpha > 0.8) blinkDir = -1;
  if (blinkAlpha < 0.2) blinkDir = 1;
  map.setPaintProperty(layerIds.value.polygon, 'fill-opacity', blinkAlpha);

  animationFrameId.value[map.id] = requestAnimationFrame(() => animate(map));
}

function startAnimation(map: MapSimple) {
  radius = 6;
  dashOffset = 0;
  blinkAlpha = 0.4;
  blinkDir = 1;
  if (animationFrameId.value[map.id] == null) {
    animate(map);
  }
}

function stopAnimation(map: MapSimple) {
  const source = map.getSource(sourceId) as GeoJSONSource;
  if (source)
    source.setData({
      type: 'FeatureCollection',
      features: [],
    });
  const id = animationFrameId.value[map.id];
  if (id != null) {
    cancelAnimationFrame(id);
    animationFrameId.value[map.id] = null;
  }
  if (animationClearFrameId.value[map.id]) {
    clearTimeout(animationClearFrameId.value[map.id]);
    animationClearFrameId.value[map.id] = null;
  }
}

function clear() {
  setFeatureHighlight(undefined, '', undefined);
}
</script>
