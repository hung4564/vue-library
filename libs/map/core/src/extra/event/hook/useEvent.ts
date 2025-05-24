import { logHelper, MapSimple } from '@hungpvq/shared-map';
import { MapEventType } from 'maplibre-gl';
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { getMap } from '../../../store';
import { logger } from '../logger';
import { addListenerMap, getCurrentEvent, removeListenerMap } from '../store';
import { IEvent } from '../types';

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
export function setEventMap(mapId: string, event: IEvent) {
  const add = () => {
    logHelper(logger, mapId, 'hook', 'useEventMap').debug('add', event);
    addListenerMap(mapId, event);
  };
  const remove = () => {
    logHelper(logger, mapId, 'hook', 'useEventMap').debug('remove', event);
    removeListenerMap(mapId, event);
  };
  const isActive = computed(() => {
    const c_event = getCurrentEvent(mapId, event.event_map_type);
    return c_event && c_event.id === event.id;
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
