import { addStore, addToQueue, getStore } from '@hungpvq/vue-map-core';
import type { GeoJSONSourceRaw, Layer } from 'mapbox-gl';
import { ref, Ref } from 'vue';

export const KEY = 'dataset-highlight';

export type MapDatasetHighlightStore = {
  feature: Ref<
    | GeoJSON.Feature<GeoJSON.Geometry>
    | GeoJSON.FeatureCollection<GeoJSON.Geometry>
    | string
    | undefined
  >;
  source: Ref<string | undefined>;
};

function initMapStore(mapId: string) {
  const store: MapDatasetHighlightStore = {
    feature: ref(undefined),
    source: ref(undefined),
  };

  addStore<MapDatasetHighlightStore>(mapId, KEY, store);
}

addToQueue(KEY, initMapStore);

export function getDatasetHighlightStore(mapId: string) {
  return getStore<MapDatasetHighlightStore>(mapId, KEY);
}

export function setFeatureHighlight(
  mapId: string,
  feature:
    | GeoJSON.Feature<GeoJSON.Geometry>
    | GeoJSON.FeatureCollection<GeoJSON.Geometry>
    | string
    | undefined,
  source?: string
) {
  const store = getDatasetHighlightStore(mapId);
  if (!store) return;

  // If setting from same source source and feature exists, clear it
  if (!feature && store.source.value === source && store.feature.value) {
    store.feature.value = undefined;
    store.source.value = undefined;
    return;
  }

  store.feature.value = feature;
  store.source.value = source;
}

export function getFeatureHighlight(mapId: string) {
  const store = getDatasetHighlightStore(mapId);
  if (!store) return;
  return store.feature;
}

export function getHighlightSource(mapId: string) {
  const store = getDatasetHighlightStore(mapId);
  if (!store) return;
  return store.source;
}
