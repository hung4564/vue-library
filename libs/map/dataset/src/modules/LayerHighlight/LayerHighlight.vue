<template lang="">
  <div></div>
</template>
<script setup lang="ts">
import type { MapSimple } from '@hungpvq/shared-map';
import { useMap, withMapProps } from '@hungpvq/vue-map-core';
import type {
  CircleLayerSpecification,
  FillLayerSpecification,
  GeoJSONSource,
  LayerSpecification,
  LineLayerSpecification,
} from 'maplibre-gl';
import { computed, ref, watch } from 'vue';
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
const { getFeatureHighlight, setFeatureHighlight } = useMapDatasetHighlight(
  mapId.value,
);
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

const updateSource = (
  map: MapSimple,
  geojsonData?: GeoJSON.Feature<GeoJSON.Geometry>,
) => {
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

const highlight = (map: MapSimple, durationMs = 5000) => {
  Object.values(layerIds.value).forEach((id) => {
    if (map.getLayer(id)) {
      map.moveLayer(id);
    }
  });
  startAnimation(map);

  if (durationMs > 0) {
    setTimeout(() => {
      clear(map);
    }, durationMs);
  }
};
let animationFrameId: number | null = null;
function updateHighlight(geojsonData?: GeoJSON.Feature<GeoJSON.Geometry>) {
  callMap((map: MapSimple) => {
    updateSource(map, geojsonData);
    highlight(map);
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

  dashOffset = (dashOffset + 1) % 1000;
  map.setPaintProperty(layerIds.value.line, 'line-dasharray', [
    2,
    4 + (dashOffset % 10) * 0.1,
  ]);

  blinkAlpha += blinkDir * 0.05;
  if (blinkAlpha > 0.8) blinkDir = -1;
  if (blinkAlpha < 0.2) blinkDir = 1;

  map.setPaintProperty(layerIds.value.polygon, 'fill-opacity', blinkAlpha);

  animationFrameId = requestAnimationFrame(() => animate(map));
}
function startAnimation(map: MapSimple) {
  if (animationFrameId == null) {
    animate(map);
  }
}
function stopAnimation() {
  if (animationFrameId != null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}
function clear(map: MapSimple) {
  const source = map.getSource(sourceId) as GeoJSONSource;
  source.setData({
    type: 'FeatureCollection',
    features: [],
  });
  setFeatureHighlight(undefined, '', undefined);
  stopAnimation();
}
</script>
