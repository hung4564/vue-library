import { getMap, logHelper, type MapSimple } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import { DatasetService } from '@hungpvq/map-dataset';
import { createMapScopedStore } from '@hungpvq/react-map-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '../logger';

const KEY = 'dataset' as const;

export type MapLayerStore = {
  datasets: Record<string, IDataset>;
  datasetIds: { value: string[] };
  version: number;
  listeners: Set<() => void>;
  allLayerShow: boolean;
};

function notify(store: MapLayerStore) {
  store.version += 1;
  store.listeners.forEach((listener) => listener());
}

/** Call after DatasetService mutates the store so React subscribers refresh. */
export function notifyMapDatasetStore(store: MapLayerStore) {
  notify(store);
}

/** Imperative store accessor (safe outside React render). */
export function getMapDatasetStore(mapId: string) {
  return createMapScopedStore<MapLayerStore>(mapId, KEY as string & object, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return {
      datasets: {},
      datasetIds: { value: [] },
      version: 0,
      listeners: new Set(),
      allLayerShow: true,
    };
  });
}

export function useMapDatasetStore(mapId: string) {
  return getMapDatasetStore(mapId);
}

export function useMapDataset(initialMapId?: string) {
  const mapIdRef = useRef(initialMapId ?? '');
  const [mapId, setMapIdState] = useState(initialMapId ?? '');
  const [version, setVersion] = useState(0);
  const store = useMapDatasetStore(mapId);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (initialMapId) {
      mapIdRef.current = initialMapId;
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

  const setMapId = useCallback((pMapId: string) => {
    mapIdRef.current = pMapId;
    setMapIdState(pMapId);
  }, []);

  const addDataset = useCallback(async (layer: IDataset) => {
    const id = mapIdRef.current;
    if (!id) return;
    const layerStore = getMapDatasetStore(id);
    getMap(id, async (map: MapSimple) => {
      await DatasetService.addDataset(layerStore, map, layer);
      notify(layerStore);
    });
  }, []);

  const removeDataset = useCallback(async (layer: IDataset) => {
    const id = mapIdRef.current;
    if (!id) return;
    const layerStore = getMapDatasetStore(id);
    getMap(id, async (map: MapSimple) => {
      await DatasetService.removeDataset(layerStore, map, layer);
      notify(layerStore);
    });
  }, []);

  const removeComponent = useCallback((component: IDataset) => {
    const id = mapIdRef.current;
    if (!id) return;
    getMap(id, async (map: MapSimple) => {
      DatasetService.removeComponent(map, component);
      notify(getMapDatasetStore(id));
    });
  }, []);

  const getAllComponentsByType = useCallback(
    <T extends IDataset>(targetType: string) => {
      const id = mapIdRef.current;
      if (!id) return [];
      return DatasetService.getAllComponentsByType<T>(
        getMapDatasetStore(id),
        targetType,
      );
    },
    [],
  );

  const getDatasetIds = useCallback(() => {
    const id = mapIdRef.current;
    if (!id) return { value: [] as string[] };
    return getMapDatasetStore(id).datasetIds;
  }, []);

  const getDatasets = useCallback(() => {
    const id = mapIdRef.current;
    if (!id) return [];
    const layerStore = getMapDatasetStore(id);
    return layerStore.datasetIds.value.map((did: string) => layerStore.datasets[did]);
  }, []);

  useEffect(() => {
    bump();
  }, [mapId, bump]);

  return {
    setMapId,
    getDatasets,
    addDataset,
    getDatasetIds,
    removeComponent,
    removeDataset,
    getStoreDataset: () =>
      mapIdRef.current ? getMapDatasetStore(mapIdRef.current) : undefined,
    getAllComponentsByType,
    datasetVersion: version,
  };
}

export * from './component';
export * from './highlight';
