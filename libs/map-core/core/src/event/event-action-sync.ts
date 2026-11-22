import type { MapSimple } from '../types';
import type { IEvent } from './model/Event';

export type EventActionSyncDeps = {
  /** Apply listener changes on the live map. */
  callMap: (cb: (map: MapSimple) => void) => void;
  /** Persist current event for a map event type and notify mitt. */
  setCurrent: (eventMapType: string, event?: IEvent) => void;
};

/**
 * Sync ActionControl map listeners: one active IEvent per event_map_type.
 */
export function createEventActionSync(deps: EventActionSyncDeps) {
  const currentByMapId: Record<string, Record<string, IEvent | undefined>> = {};

  function updateEventMap(events: IEvent[]) {
    const listeners: Record<string, IEvent[]> = {};
    for (const event of events) {
      const key = event.event_map_type;
      if (!listeners[key]) listeners[key] = [];
      listeners[key].push(event);
    }
    deps.callMap((map) => {
      const keyAdd: string[] = [];
      if (!currentByMapId[map.id]) {
        currentByMapId[map.id] = {};
      }
      for (const key of Object.keys(listeners)) {
        keyAdd.push(key);
        const list = listeners[key];
        const current = currentByMapId[map.id][key];
        const next = list[0];

        if (current && current.id === next.id) {
          continue;
        }
        if (current) {
          current.removeFromMap(map);
        }
        currentByMapId[map.id][key] = next;
        if (next) {
          next.addToMap(map);
        }
        deps.setCurrent(key, next);
      }
      for (const key in currentByMapId[map.id]) {
        if (Object.prototype.hasOwnProperty.call(currentByMapId[map.id], key)) {
          const element = currentByMapId[map.id][key];
          if (!keyAdd.includes(key) && element) {
            element.removeFromMap(map);
            deps.setCurrent(key, undefined);
            currentByMapId[map.id][key] = undefined;
          }
        }
      }
    });
  }

  return { updateEventMap };
}
