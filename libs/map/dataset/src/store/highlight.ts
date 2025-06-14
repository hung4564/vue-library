import { logHelper } from '@hungpvq/shared-map';
import { defineStore } from '@hungpvq/shared-store';
import type { GeoJSONFeature } from 'maplibre-gl';
import type { Ref } from 'vue';
import { ref } from 'vue';
import type { IDataset } from '../interfaces';
import { logger } from '../logger';

export type MapDatasetHighlightStore = {
  feature: Ref<GeoJSONFeature | undefined>;
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
  function getStore() {
    return store;
  }
  function setFeatureHighlight(
    feature: GeoJSONFeature | undefined,
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
