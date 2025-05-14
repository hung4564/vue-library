import type { MapSimple } from '@hungpvq/shared-map';
import { addStore, addToQueue, getMap, getStore } from '@hungpvq/vue-map-core';
import type { Ref } from 'vue';
import { ref } from 'vue';
import type { IDataset, IMapboxLayerView } from '../interfaces';
import { findSiblingOrNearestLeaf } from '../model';

export const KEY = 'dataset-highlight';

export type MapDatasetHighlightStore = {
  feature: Ref<GeoJSON.Feature<GeoJSON.Geometry> | undefined>;
  source: Ref<string | undefined>;
  dataset?: IDataset;
};

function initMapStore(mapId: string) {
  const store: MapDatasetHighlightStore = {
    feature: ref(undefined),
    source: ref(undefined),
    dataset: undefined,
  };

  addStore<MapDatasetHighlightStore>(mapId, KEY, store);
}

addToQueue(KEY, initMapStore);

export function getDatasetHighlightStore(mapId: string) {
  return getStore<MapDatasetHighlightStore>(mapId, KEY);
}

export function setFeatureHighlight(
  mapId: string,
  feature: GeoJSON.Feature<GeoJSON.Geometry> | undefined,
  source: string,
  dataset?: IDataset,
) {
  const store = getDatasetHighlightStore(mapId);
  if (!store) return;

  // If setting from same source source and feature exists, clear it
  if (!feature && store.source.value === source && store.feature.value) {
    store.feature.value = undefined;
    store.source.value = undefined;
    if (store.dataset) {
      const source = findSiblingOrNearestLeaf(
        store.dataset,
        (dataset) => dataset.type == 'layer',
      ) as unknown as IMapboxLayerView;
      if (source && 'hightLight' in source) {
        getMap(mapId, (map: MapSimple) => {
          source.hightLight?.(map, undefined);
        });
        return;
      }
    }
    store.dataset = undefined;
    return;
  }
  store.dataset = dataset;
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

export function getDatesetHighlight(mapId: string) {
  const store = getDatasetHighlightStore(mapId);
  if (!store) return;
  return store.dataset;
}
