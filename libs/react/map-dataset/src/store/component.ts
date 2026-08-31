import { logHelper } from '@hungpvq/map-core';
import type { ComponentType } from '@hungpvq/map-dataset';
import { createMapScopedStore } from '@hungpvq/react-map-core';
import { useCallback, useEffect, useState } from 'react';
import { logger } from '../logger';

const KEY = 'dataset-component' as const;

export type ComponentItem = {
  id: string;
  check?: string;
} & ComponentType;

export type MapDatasetComponentStore = {
  components: ComponentItem[];
  componentIds: { value: string[] };
  version: number;
  listeners: Set<() => void>;
};

function generateId(prefix = 'component'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function notify(store: MapDatasetComponentStore) {
  store.version += 1;
  store.listeners.forEach((listener) => listener());
}

export function useMapDatasetComponentStore(mapId: string) {
  return createMapScopedStore<MapDatasetComponentStore>(mapId, KEY as string & object, () => {
    logHelper(logger, mapId, 'store').debug('init component store');
    return {
      components: [],
      componentIds: { value: [] },
      version: 0,
      listeners: new Set(),
    };
  });
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
      if (component.check) {
        const index = store.components.findIndex(
          (x: ComponentItem) => x.check === component.check,
        );
        if (index >= 0) {
          const id = store.components[index].id;
          Object.assign(store.components[index], component);
          store.componentIds.value.splice(index, 1);
          store.componentIds.value.push(id);
          notify(store);
          return id;
        }
      }
      const id = generateId();
      store.components.push({ ...component, id });
      store.componentIds.value.push(id);
      notify(store);
      return id;
    },
    [store],
  );

  const removeComponent = useCallback(
    (id: string) => {
      if (!store) return;
      store.components = store.components.filter(
        (x: ComponentItem) => x.id !== id,
      );
      store.componentIds.value = store.componentIds.value.filter(
        (x: string) => x !== id,
      );
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
