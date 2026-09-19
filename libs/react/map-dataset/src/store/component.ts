import { isUsableMapId, logHelper } from '@hungpvq/map-core';
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

const EMPTY_COMPONENT_STORE: MapDatasetComponentStore = {
  components: [],
  componentIds: { value: [] },
  version: 0,
  listeners: new Set(),
};

export function useMapDatasetComponentStore(mapId: string) {
  if (!isUsableMapId(mapId)) return EMPTY_COMPONENT_STORE;
  return createMapScopedStore<MapDatasetComponentStore>(
    mapId,
    KEY as string & object,
    () => {
      logHelper(logger, mapId, 'store')
        .with({ fn: 'useMapDatasetComponentStore', span: 'store.init' })
        .debug('init component store');
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
    if (!isUsableMapId(mapId)) return;
    const listener = () => setTick((v) => v + 1);
    store.listeners.add(listener);
    return () => {
      store.listeners.delete(listener);
    };
  }, [store, mapId]);

  const addComponent = useCallback(
    (component: Omit<ComponentItem, 'id'>) => {
      if (!isUsableMapId(mapId)) return;
      const id = upsertDatasetComponent(store, component);
      notify(store);
      return id;
    },
    [store, mapId],
  );

  const removeComponent = useCallback(
    (id: string) => {
      if (!isUsableMapId(mapId)) return;
      removeDatasetComponent(store, id);
      notify(store);
    },
    [store, mapId],
  );

  return {
    getStore: () => store,
    getAllComponentIds: () => store.componentIds,
    addComponent,
    removeComponent,
    version: store.version,
  };
}
