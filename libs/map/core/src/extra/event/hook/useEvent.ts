import { logHelper, MapSimple } from '@hungpvq/shared-map';
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
import { IEvent, MittTypeMapEvent, MittTypeMapEventEventKey } from '../types';

export function useComponentName() {
  const instance = getCurrentInstance();
  const name = instance?.type.name || 'unknown-component';
  return name;
}

export function useEventMap(mapId: string, event: IEvent, immediate = false) {
  const { add, remove, isActive } = setEventMap(mapId, event);
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
function setEventMap(mapId: string, event: IEvent) {
  const name = useComponentName();
  event.from = event.from || name;
  const store = useMapEventStore(mapId);
  const emitter = useMapMittStore<MittTypeMapEvent>(mapId);
  onMounted(() => {
    emitter.on(MittTypeMapEventEventKey.setCurrent, updateCurrent);
  });
  onUnmounted(() => {
    emitter.off(MittTypeMapEventEventKey.setCurrent, updateCurrent);
  });
  const add = () => {
    logHelper(logger, mapId, 'hook', 'useEventMap').debug('add', event);
    store.items.unshift(event);
    emitter.emit(MittTypeMapEventEventKey.add, event);
    emitter.emit(MittTypeMapEventEventKey.setItems, store.items);
  };
  const remove = () => {
    logHelper(logger, mapId, 'hook', 'useEventMap').debug('remove', event);
    if (!store || !store.items || store.items.length < 1) {
      return;
    }
    const events = store.items;
    const event_index = events.findIndex((x) => x.id === event.id);
    if (event_index < 0) {
      return;
    }
    store.items.splice(event_index, 1);
    emitter.emit(MittTypeMapEventEventKey.remove, event);
    emitter.emit(MittTypeMapEventEventKey.setItems, store.items);
  };
  function updateCurrent(value: IEvent | undefined | null) {
    current.value = value;
  }
  const current = shallowRef<IEvent | undefined | null>();
  const isActive = computed(() => {
    return !!current.value && current.value.id === event.id;
  });
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
