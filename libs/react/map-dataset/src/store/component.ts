import { logHelper } from '@hungpvq/map-core';
import {
  removeDatasetComponent,
  upsertDatasetComponent,
  type DatasetComponentItem,
} from '@hungpvq/map-dataset';
import { createMapScopedStore } from '@hungpvq/react-map-core';
import { useCallback, useEffect, useState } from 'react';
import { logger } from '@hungpvq/map-dataset';

const KEY = 'dataset-component' as const;

export type ComponentItem = DatasetComponentItem;

export type MapDatasetComponentStore = {
  components: ComponentItem[];
  componentIds: { value: string[] };
  version: number;
  listeners: Set<() => void>;
};

function notify(store: MapDatasetComponentStore) {
  store.version += 1;
  store.listeners.forEach((listener) => listener());
}

export function useMapDatasetComponentStore(mapId: string) {
  return createMapScopedStore<MapDatasetComponentStore>(
    mapId,
    KEY as string & object,
    () => {
      logHelper(logger, mapId, 'store').debug('init component store');
      return {
        components: [],
        componentIds: { value: [] },
        version: 0,
        listeners: new Set(),
      };
    },
  );
}

export function useMapDatasetComponent(mapId: string) {
  const store = useMapDatasetComponentStore(mapId);
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((v) => v + 1);
    store.listeners.add(listener);
    return () => {
      store.listeners.delete(listener);
    };
  }, [store]);

  const addComponent = useCallback(
    (component: Omit<ComponentItem, 'id'>) => {
      if (!store) return;
      const id = upsertDatasetComponent(store, component);
      notify(store);
      return id;
    },
    [store],
  );

  const removeComponent = useCallback(
    (id: string) => {
      if (!store) return;
      removeDatasetComponent(store, id);
      notify(store);
    },
    [store],
  );

  return {
    getStore: () => store,
    getAllComponentIds: () => store.componentIds,
    addComponent,
    removeComponent,
    version: store.version,
  };
}
