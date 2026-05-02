import {
  type AnyIEvent,
  EventManager,
  logHelper,
  MapSimple,
  MittTypeMapEvent,
  MittTypeMapEventEventKey,
} from '@hungpvq/map-core';
import { MapEventType } from 'maplibre-gl';
import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  shallowRef,
} from 'vue';
import { getMap } from '../../../store';
import { useMapMittStore } from '../../mitt';
import { logger } from '../logger';
import { useMapEventStore } from '../store';

export function useComponentName() {
  const instance = getCurrentInstance();
  const name = instance?.type.name || 'unknown-component';
  return name;
}

export function useEventMap(
  mapId: string,
  event: AnyIEvent,
  immediate = false,
) {
  const store = useMapEventStore(mapId);
  const emitter = useMapMittStore<MittTypeMapEvent>(mapId);
  const componentName = useComponentName();

  // Create EventManager instance (core is single source of truth)
  const manager = new EventManager(
    mapId,
    store,
    emitter,
    (mapIdParam, level, message, data) => {
      logHelper(logger, mapIdParam, 'hook', 'useEventMap')[level](
        message,
        data,
      );
    },
  );

  // Vue reactive state - mirror from core state
  const current = shallowRef<AnyIEvent | undefined | null>(
    manager.getCurrent(event.id),
  );
  const isActive = computed(() => manager.isActive(event.id));

  // Subscribe to events and mirror state
  const updateCurrentHandler = (value: AnyIEvent | undefined | null) => {
    current.value = value;
  };

  onMounted(() => {
    emitter.on(MittTypeMapEventEventKey.setCurrent, updateCurrentHandler);
  });

  onUnmounted(() => {
    emitter.off(MittTypeMapEventEventKey.setCurrent, updateCurrentHandler);
  });

  // Methods that delegate to core manager
  const add = () => {
    manager.add(event, componentName);
  };

  const remove = () => {
    manager.remove(event);
  };

  onBeforeUnmount(() => {
    remove();
  });

  if (immediate) {
    onMounted(() => {
      add();
    });
  }

  return { add, remove, isActive };
}

type KnownMapEvent = keyof MapEventType;
export function useEventListener<K extends KnownMapEvent>(
  mapId: string,
  event: K,
  cb: (map: MapSimple, ev: MapEventType[K] & object) => void,
  immediate = true,
): { add: () => void; remove: () => void } {
  const wrappedCb: Record<string, ((ev: MapEventType[K]) => void) | undefined> =
    {};
  const add = () => {
    logHelper(logger, mapId, 'hook', 'useEventListener').debug('add', event);
    getMap(mapId, (map) => {
      const eventHandle = (ev: MapEventType[K]) => cb(map, ev);
      wrappedCb[map.id] = eventHandle;
      map.on(event, eventHandle);
    });
  };
  const remove = () => {
    logHelper(logger, mapId, 'hook', 'useEventListener').debug('remove', event);
    getMap(mapId, (map) => {
      const eventHandle = wrappedCb?.[map.id];
      if (eventHandle) map.off(event, eventHandle);
    });
  };
  onMounted(() => {
    if (immediate) {
      add();
    }
  });
  onBeforeUnmount(() => {
    remove();
  });
  return { add, remove };
}
