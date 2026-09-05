import { useCallback, useEffect, useRef } from 'react';
import type { IEvent, MittTypeMapEvent, WithMapPropType } from '@hungpvq/map-core';
import { MittTypeMapEventEventKey } from '@hungpvq/map-core';
import { defaultMapProps, useMap } from '../../../hooks';
import { useMapMittStore } from '../../mitt';
import { useEventMapItems } from '../hook';
import { useMapEventStore } from '../store';

export function ActionControl(props: WithMapPropType) {
  const merged = { ...defaultMapProps, ...props };
  const { callMap, mapId } = useMap(merged);
  const store = useMapEventStore(mapId);
  const emitter = useMapMittStore<MittTypeMapEvent>(mapId);
  const currentListener = useRef<
    Record<string, Record<string, IEvent | undefined>>
  >({});

  const setCurrentEvent = useCallback(
    (event_map_type: string, event?: IEvent) => {
      store.current[event_map_type] = event;
      emitter.emit(MittTypeMapEventEventKey.setCurrent, event);
    },
    [store, emitter],
  );

  const updateEventMap = useCallback(
    (events: IEvent[]) => {
      const listeners: Record<string, IEvent[]> = {};
      events.forEach((event) => {
        const key = event.event_map_type;
        if (!listeners[key]) listeners[key] = [];
        listeners[key].push(event);
      });
      callMap((map) => {
        if (!currentListener.current[map.id]) {
          currentListener.current[map.id] = {};
        }
        const keyAdd: string[] = [];
        for (const key of Object.keys(listeners)) {
          keyAdd.push(key);
          const group = listeners[key];
          const current = currentListener.current[map.id][key];
          const newCurrent = group[0];
          if (current && current.id === newCurrent.id) continue;
          if (current) current.removeFromMap(map);
          currentListener.current[map.id][key] = newCurrent;
          if (newCurrent) newCurrent.addToMap(map);
          setCurrentEvent(key, newCurrent);
        }
        for (const key of Object.keys(currentListener.current[map.id])) {
          if (!keyAdd.includes(key)) {
            const current = currentListener.current[map.id][key];
            if (current) current.removeFromMap(map);
            delete currentListener.current[map.id][key];
            setCurrentEvent(key, undefined);
          }
        }
      });
    },
    [callMap, setCurrentEvent],
  );

  // Match Vue: apply map listeners immediately via onChange (don't rely only on
  // useEffect(items) — store.items is mutated in place).
  useEventMapItems(mapId, { onChange: updateEventMap });

  useEffect(() => {
    updateEventMap(store.items);
  }, [mapId, store, updateEventMap]);

  return null;
}
