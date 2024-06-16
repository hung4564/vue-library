import { computed, onBeforeUnmount, onMounted } from 'vue';
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
    addListenerMap(mapId, event);
  };
  const remove = () => {
    removeListenerMap(mapId, event);
  };
  const isActive = computed(() => {
    const c_event = getCurrentEvent(mapId, event.event_map_type);
    return c_event && c_event.id === event.id;
  });
  return { add, remove, isActive };
}
