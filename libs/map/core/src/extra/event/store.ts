import { addStore, addToQueue, getStore } from '../../store';
import { MittType } from '../../types';
import { MAP_STORE_KEY } from '../../types/key';
import { IEvent, MittTypeMapEvent, MittTypeMapEventEventKey } from './types';

export type MapEventStore = {
  items: IEvent[];
  current: { [key: string]: IEvent | undefined };
};
function initMapEvent(mapId: string) {
  addStore<MapEventStore>(mapId, MAP_STORE_KEY.EVENT, {
    items: [],
    current: {},
  });
}
addToQueue(MAP_STORE_KEY.EVENT, initMapEvent);

export async function addListenerMap(mapId: string, event: IEvent) {
  const store = getStore<MapEventStore>(mapId, MAP_STORE_KEY.EVENT);
  store.items.unshift(event);
  const emitter = getStore<MittType<MittTypeMapEvent>>(
    mapId,
    MAP_STORE_KEY.MITT,
  );
  emitter.emit(MittTypeMapEventEventKey.add, event);
  emitter.emit(MittTypeMapEventEventKey.setItems, store.items);
}

export async function removeListenerMap(mapId: string, event: IEvent) {
  const store = getStore<MapEventStore>(mapId, MAP_STORE_KEY.EVENT);
  if (!store || !store.items || store.items.length < 1) {
    return;
  }
  const events = store.items;
  const event_index = events.findIndex((x) => x.id === event.id);
  if (event_index < 0) {
    return;
  }
  store.items.splice(event_index, 1);
  const emitter = getStore<MittType<MittTypeMapEvent>>(
    mapId,
    MAP_STORE_KEY.MITT,
  );
  emitter.emit(MittTypeMapEventEventKey.remove, event);
  emitter.emit(MittTypeMapEventEventKey.setItems, store.items);
}

export function getCurrentEvent(mapId: string, event_map_type: string) {
  return (getStore<MapEventStore>(mapId, MAP_STORE_KEY.EVENT).current || {})[
    event_map_type
  ];
}

export function getEvents(mapId: string) {
  return getStore<MapEventStore>(mapId, MAP_STORE_KEY.EVENT).items;
}

export function setCurrentEvent(
  mapId: string,
  event_map_type: string,
  event?: IEvent,
) {
  const store = getStore<MapEventStore>(mapId, MAP_STORE_KEY.EVENT);
  store.current[event_map_type] = event;
  const emitter = getStore<MittType<MittTypeMapEvent>>(
    mapId,
    MAP_STORE_KEY.MITT,
  );
  emitter.emit(MittTypeMapEventEventKey.setCurrent, event);
}
