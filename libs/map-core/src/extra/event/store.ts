import { reactive } from 'vue';
import { addStore, addToQueue, getStore } from '../../store';
import { IEvent } from './types';

export const KEY = 'event';
export type MapEventStore = {
  items: IEvent[];
  current: { [key: string]: IEvent | undefined };
};
function initMapEvent(mapId: string) {
  addStore<MapEventStore>(mapId, KEY, reactive({ items: [], current: {} }));
}
addToQueue(KEY, initMapEvent);

export async function addListenerMap(mapId: string, event: IEvent) {
  const store = getStore<MapEventStore>(mapId, KEY);
  store.items.unshift(event);
}

export async function removeListenerMap(mapId: string, event: IEvent) {
  const store = getStore<MapEventStore>(mapId, KEY);
  if (!store || !store.items || store.items.length < 1) {
    return;
  }
  const events = store.items;
  const event_index = events.findIndex((x) => x.id === event.id);
  if (event_index < 0) {
    return;
  }
  store.items.splice(event_index, 1);
}

export function getCurrentEvent(mapId: string, event_map_type: string) {
  return (getStore<MapEventStore>(mapId, KEY).current || {})[event_map_type];
}

export function setCurrentEvent(
  mapId: string,
  event_map_type: string,
  event?: IEvent
) {
  const store = getStore<MapEventStore>(mapId, KEY);
  store.current[event_map_type] = event;
}
