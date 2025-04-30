<template lang="">
  <div></div>
</template>
<script setup lang="ts">
import type { MapSimple } from '@hungpvq/shared-map';
import { useMap, withMapProps } from '@hungpvq/vue-map-core';
import type { Feature, FeatureCollection } from '@turf/turf';
import { center } from '@turf/turf';
import type {
  FillLayerSpecification,
  GeoJSONSource,
  GeoJSONSourceSpecification,
} from 'maplibre-gl';
import { Marker } from 'maplibre-gl';
import { computed, watch } from 'vue';
import { IMapboxLayerView } from '../../interfaces';
import { findSiblingOrNearestLeaf } from '../../model/dataset.visitors';
import {
  getDatesetHighlight,
  getFeatureHighlight,
} from '../../store/highlight';

const props = defineProps({
  ...withMapProps,
  layer: {
    type: Object,
    default: () => ({
      type: 'line',
      paint: {
        'line-color': '#004E98',
        'line-width': 4,
        'line-dasharray': [2, 2],
      },
    }),
  },
});

const sourceId = 'source-highlighted';
const layerId = 'layer-highlighted';
let marker: Marker | undefined = undefined;
const { mapId, callMap } = useMap(props);

const storeFeature = computed(() => {
  return getFeatureHighlight(mapId.value)?.value;
});

const updateSource = (
  map: MapSimple,
  geojsonData?: GeoJSON.Feature<GeoJSON.Geometry>
) => {
  const source = map.getSource(sourceId) as GeoJSONSource;
  if (source) {
    source.setData(
      geojsonData || {
        type: 'FeatureCollection' as const,
        features: [],
      }
    );
  } else {
    map.addSource(sourceId, {
      type: 'geojson',
      data: geojsonData || {
        type: 'FeatureCollection' as const,
        features: [],
      },
    });
  }
};

const updateLayer = (map: MapSimple) => {
  if (map.getLayer(layerId)) {
    map.moveLayer(layerId);
  } else {
    const layer = { ...props.layer } as FillLayerSpecification;
    layer.source = sourceId;
    layer.id = layerId;
    const topLayerId =
      map.getStyle().layers?.[map.getStyle().layers.length - 1]?.id;
    map.addLayer(layer, topLayerId);
  }
};

const updateMarker = (
  map: MapSimple,
  geojsonData: GeoJSONSourceSpecification['data']
) => {
  marker?.remove();
  marker = undefined;

  if (!geojsonData || typeof geojsonData === 'string') return;

  const hasFeatures =
    geojsonData.type === 'Feature' ||
    (geojsonData.type === 'FeatureCollection' &&
      geojsonData.features?.length > 0);

  if (!hasFeatures) return;

  const markCenter = center(geojsonData as Feature | FeatureCollection);
  const coordinates = markCenter?.geometry?.coordinates;

  if (Array.isArray(coordinates)) {
    const [lng, lat] = coordinates;
    marker = new Marker({})
      .setLngLat([lng, lat] as [number, number])
      .addTo(map);
  }
};

function updateHighlight(geojsonData?: GeoJSON.Feature<GeoJSON.Geometry>) {
  const dataset = getDatesetHighlight(mapId.value);
  if (dataset) {
    const source = findSiblingOrNearestLeaf(
      dataset,
      (dataset) => dataset.type == 'layer'
    ) as unknown as IMapboxLayerView;
    if (source && 'hightLight' in source) {
      callMap((map: MapSimple) => {
        source.hightLight?.(map, geojsonData);
      });
      return;
    }
  }
  callMap((map: MapSimple) => {
    updateSource(map, geojsonData);
    updateLayer(map);
    updateMarker(map, geojsonData as any);
  });
}

watch(
  storeFeature,
  () => {
    updateHighlight(storeFeature.value);
  },
  { deep: true }
);
</script>
