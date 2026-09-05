import { logHelper, type MapSimple } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import { DatasetService } from '@hungpvq/map-dataset';
import { createMapScopedStore, useMapStore } from '@hungpvq/react-map-core';
import { useCallback, useEffect, useState } from 'react';
import { logger } from '../logger';

const KEY = 'dataset' as const;

export type MapLayerStore = {
  datasets: Record<string, IDataset>;
  datasetIds: { value: string[] };
  version: number;
  listeners: Set<() => void>;
};

function notify(store: MapLayerStore) {
  store.version += 1;
  store.listeners.forEach((listener) => listener());
}

/** Call after DatasetService mutates the store so React subscribers refresh. */
export function notifyMapDatasetStore(store: MapLayerStore) {
  notify(store);
}

export function useMapDatasetStore(mapId: string) {
  return createMapScopedStore<MapLayerStore>(mapId, KEY as string & object, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return {
      datasets: {},
      datasetIds: { value: [] },
      version: 0,
      listeners: new Set(),
    };
  });
}

export function useMapDataset(initialMapId?: string) {
  const [mapId, setMapIdState] = useState(initialMapId ?? '');
  const [version, setVersion] = useState(0);
  const store = useMapDatasetStore(mapId);
  const { getMap } = useMapStore(mapId);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (initialMapId) {
      setMapIdState(initialMapId);
    }
  }, [initialMapId]);

  useEffect(() => {
    if (!mapId) return;
    const listener = () => bump();
    store.listeners.add(listener);
    return () => {
      store.listeners.delete(listener);
    };
  }, [mapId, store, bump]);

  const addDataset = useCallback(
    async (layer: IDataset) => {
      if (!mapId) return;
      getMap(async (map: MapSimple) => {
        await DatasetService.addDataset(store, map, layer);
        notify(store);
      });
    },
    [mapId, store, getMap],
  );

  const removeDataset = useCallback(
    async (layer: IDataset) => {
      if (!mapId) return;
      getMap(async (map: MapSimple) => {
        await DatasetService.removeDataset(store, map, layer);
        notify(store);
      });
    },
    [mapId, store, getMap],
  );

  const removeComponent = useCallback(
    (component: IDataset) => {
      if (!mapId) return;
      getMap(async (map: MapSimple) => {
        DatasetService.removeComponent(map, component);
        notify(store);
      });
    },
    [mapId, store, getMap],
  );

  const getAllComponentsByType = useCallback(
    <T extends IDataset>(targetType: string) => {
      if (!mapId) return [];
      return DatasetService.getAllComponentsByType<T>(store, targetType);
    },
    [mapId, store],
  );

  const getDatasetIds = useCallback(() => {
    if (!mapId) return { value: [] as string[] };
    return store.datasetIds;
  }, [mapId, store]);

  const getDatasets = useCallback(() => {
    if (!mapId) return [];
    return store.datasetIds.value.map((id: string) => store.datasets[id]);
  }, [mapId, store]);

  useEffect(() => {
    bump();
  }, [mapId, bump]);

  return {
    setMapId(pMapId: string) {
      setMapIdState(pMapId);
    },
    getDatasets,
    addDataset,
    getDatasetIds,
    removeComponent,
    removeDataset,
    getStoreDataset: () => (mapId ? store : undefined),
    getAllComponentsByType,
    datasetVersion: version,
  };
}

export * from './component';
export * from './highlight';
