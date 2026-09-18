import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { WithMapPropType } from '@hungpvq/map-core';
import {
  createEventActionSync,
  MittTypeMapEventEventKey,
  type IEvent,
  type MittTypeMapEvent,
} from '@hungpvq/map-core/event';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import { useMapMittStore } from '../../../store/mitt-store';
import { useEventMapItems } from '../hook/useEventMapItems';
import { useMapEventStore } from '../store';

export function ActionControl(props: WithMapPropType) {
  const merged = { ...defaultMapProps, ...props };
  const { callMap, mapId } = useMap(merged);
  const store = useMapEventStore(mapId);
  const emitter = useMapMittStore<MittTypeMapEvent>(mapId);

  const setCurrentEvent = useCallback(
    (event_map_type: string, event?: IEvent) => {
      store.current[event_map_type] = event;
      emitter.emit(MittTypeMapEventEventKey.setCurrent, event);
    },
    [store, emitter],
  );

  const depsRef = useRef({ callMap, setCurrentEvent });
  depsRef.current = { callMap, setCurrentEvent };

  const { updateEventMap } = useMemo(
    () =>
      createEventActionSync({
        callMap: (cb) => depsRef.current.callMap(cb),
        setCurrent: (type, event) => depsRef.current.setCurrentEvent(type, event),
      }),
    [],
  );

  // Match Vue: apply map listeners immediately via onChange (don't rely only on
  // useEffect(items) — store.items is mutated in place).
  useEventMapItems(mapId, { onChange: updateEventMap });

  useEffect(() => {
    updateEventMap(store.items);
  }, [mapId, store, updateEventMap]);

  return null;
}
