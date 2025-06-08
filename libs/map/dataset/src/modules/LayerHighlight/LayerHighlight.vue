<template lang="">
  <div></div>
</template>
<script setup lang="ts">
import { mergeFilters, type MapSimple } from '@hungpvq/shared-map';
import { useMap, withMapProps } from '@hungpvq/vue-map-core';
import type {
  CircleLayerSpecification,
  FillLayerSpecification,
  GeoJSONFeature,
  GeoJSONSource,
  LayerSpecification,
  LineLayerSpecification,
} from 'maplibre-gl';
import { computed, ref, toRaw, watch } from 'vue';
import { findSiblingOrNearestLeaf, IHighlightView } from '../../model';
import { useMapDatasetHighlight } from '../../store/highlight';
const props = defineProps({
  ...withMapProps,
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
  Object.values(layerIds.value).forEach((id) => {
    if (map.getLayer(id)) {
      map.removeLayer(id);
    }
  });
  if (map.getSource(sourceId)) {
    map.removeSource(sourceId);
  }
}
const storeFeature = computed(() => {
  return getFeatureHighlight();
});
const updateLayer = (
  map: MapSimple,
  highlightView?: IHighlightView,
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
const highlight = (map: MapSimple, durationMs = 5000) => {
  Object.values(layerIds.value).forEach((id) => {
    if (map.getLayer(id)) {
      map.moveLayer(id);
    }
  });
  startAnimation(map);

  if (durationMs > 0) {
    clearTimeout(animationClearFrameId.value[map.id]);
    animationClearFrameId.value[map.id] = setTimeout(() => {
      clear(map);
    }, durationMs);
  }
};
const animationFrameId = ref<Record<string, number | null>>({});
function updateHighlight(geojsonData?: GeoJSONFeature) {
  const dataset = getDatesetHighlight();
  let highlightView: IHighlightView | undefined = undefined;
  if (dataset) {
    highlightView = findSiblingOrNearestLeaf(
      dataset,
      (dataset) => dataset.type == 'highlight',
    ) as unknown as IHighlightView;
  }
  callMap((map: MapSimple) => {
    updateLayer(map, highlightView, geojsonData);
    if (!highlightView) {
      updateSource(map, geojsonData);
    }
    if (geojsonData) highlight(map);
  });
}

watch(
  storeFeature,
  () => {
    updateHighlight(storeFeature.value?.value);
  },
  { deep: true },
);

let radius = 6;
let grow = true;
let dashOffset = 0;
let blinkAlpha = 0.4;
let blinkDir = 1;

function animate(map: MapSimple) {
  radius += grow ? 0.2 : -0.2;
  if (radius >= 12) grow = false;
  if (radius <= 6) grow = true;
  map.setPaintProperty(layerIds.value.point, 'circle-radius', radius);

  dashOffset += 0.1;
  dashOffset = +dashOffset.toFixed(1);
  if (dashOffset >= 6) dashOffset = 0; // vòng lại (2 + 4 = 6)

  const dashArray = [2, 4]; // đơn vị pixel hoặc tỉ lệ
  const animatedDash = dashArray.map((val) => val + dashOffset);
  map.setPaintProperty(layerIds.value.line, 'line-dasharray', animatedDash);

  blinkAlpha += blinkDir * 0.05;
  if (blinkAlpha > 0.8) blinkDir = -1;
  if (blinkAlpha < 0.2) blinkDir = 1;

  map.setPaintProperty(layerIds.value.polygon, 'fill-opacity', blinkAlpha);

  animationFrameId.value[map.id] = requestAnimationFrame(() => animate(map));
}
function startAnimation(map: MapSimple) {
  const id = animationFrameId.value[map.id];
  if (id == null) {
    animate(map);
  }
}
function stopAnimation(map: MapSimple) {
  const id = animationFrameId.value[map.id];
  if (id != null) {
    cancelAnimationFrame(id);
    animationFrameId.value[map.id] = null;
  }
}
function clear(map: MapSimple) {
  const source = map.getSource(sourceId) as GeoJSONSource;
  source.setData({
    type: 'FeatureCollection',
    features: [],
  });
  setFeatureHighlight(undefined, '', undefined);
  stopAnimation(map);
}
</script>
