import { logHelper, type MapSimple } from '@hungpvq/shared-map';
import { defineStore } from '@hungpvq/shared-store';
import { useMapStore } from '@hungpvq/vue-map-core';
import type { Ref } from 'vue';
import { ref } from 'vue';
import type { IDataset, IMapboxLayerView } from '../interfaces';
import { logger } from '../logger';
import { findSiblingOrNearestLeaf } from '../model';

export const KEY = 'dataset-highlight';

export type MapDatasetHighlightStore = {
  feature: Ref<GeoJSON.Feature<GeoJSON.Geometry> | undefined>;
  source: Ref<string | undefined>;
  dataset?: IDataset;
};

export const useMapDatasetHighlightStore = (mapId: string) =>
  defineStore<MapDatasetHighlightStore>(
    ['map:core', mapId, 'store-highlight'],
    () => {
      logHelper(logger, mapId, 'store').debug('init');
      return {
        feature: ref(undefined),
        source: ref(undefined),
        dataset: undefined,
      };
    },
  )();
export const useMapDatasetHighlight = (mapId: string) => {
  const store = useMapDatasetHighlightStore(mapId);
  const { getMap } = useMapStore(mapId);
  function getStore() {
    return store;
  }
  function setFeatureHighlight(
    feature: GeoJSON.Feature<GeoJSON.Geometry> | undefined,
    source: string,
    dataset?: IDataset,
  ) {
    if (!store) return;

    logHelper(logger, mapId, 'store-highlight').debug('setFeatureHighlight', {
      store,
      feature,
      source,
      dataset,
    });
    // If setting from same source source and feature exists, clear it
    if (!feature && store.source.value === source && store.feature.value) {
      store.feature.value = undefined;
      store.source.value = undefined;
      store.dataset = undefined;
      return;
    }
    store.dataset = dataset;
    store.feature.value = feature;
    store.source.value = source;
  }

  function getFeatureHighlight() {
    if (!store) return;
    return store.feature;
  }

  function getHighlightSource() {
    if (!store) return;
    return store.source;
  }

  function getDatesetHighlight() {
    if (!store) return;
    return store.dataset;
  }

  return {
    getStore,
    setFeatureHighlight,
    getHighlightSource,
    getDatesetHighlight,
    getFeatureHighlight,
  };
};
