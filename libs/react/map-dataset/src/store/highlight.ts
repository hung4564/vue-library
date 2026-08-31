import { logHelper } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import { createMapScopedStore } from '@hungpvq/react-map-core';
import type { Feature } from 'geojson';
import type { GeoJSONFeature } from 'maplibre-gl';
import { useEffect, useState } from 'react';
import { logger } from '../logger';

export type MapDatasetHighlightStore = {
  feature: Feature | GeoJSONFeature | undefined;
  source: string | undefined;
  dataset?: IDataset;
  version: number;
  listeners: Set<() => void>;
};

const KEY = 'highlight' as const;

function notify(store: MapDatasetHighlightStore) {
  store.version += 1;
  store.listeners.forEach((listener) => listener());
}

export function useMapDatasetHighlightStore(mapId: string) {
  return createMapScopedStore<MapDatasetHighlightStore>(mapId, KEY as string & object, () => {
    logHelper(logger, mapId, 'store').debug('init highlight store');
    return {
      feature: undefined,
      source: undefined,
      dataset: undefined,
      version: 0,
      listeners: new Set(),
    };
  });
}

export function useMapDatasetHighlight(mapId: string) {
  const store = useMapDatasetHighlightStore(mapId);
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((v) => v + 1);
    store.listeners.add(listener);
    return () => {
      store.listeners.delete(listener);
    };
  }, [store]);

  function setFeatureHighlight(
    feature: Feature | GeoJSONFeature | undefined,
    source: string,
    dataset?: IDataset,
  ) {
    if (!store) return;
    logHelper(logger, mapId, 'highlight').debug('setFeatureHighlight', {
      feature,
      source,
      dataset,
    });
    if (!feature && store.source === source && store.feature) {
      store.feature = undefined;
      store.source = undefined;
      store.dataset = undefined;
      notify(store);
      return;
    }
    store.dataset = dataset;
    store.feature = feature;
    store.source = source;
    notify(store);
  }

  return {
    getStore: () => store,
    setFeatureHighlight,
    getHighlightSource: () => store.source,
    getDatesetHighlight: () => store.dataset,
    getFeatureHighlight: () => store.feature,
    version: store.version,
  };
}
