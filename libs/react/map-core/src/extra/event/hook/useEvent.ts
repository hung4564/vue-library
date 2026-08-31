import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type AnyIEvent,
  EventManager,
  logHelper,
  type MapSimple,
  type MittTypeMapEvent,
  MittTypeMapEventEventKey,
} from '@hungpvq/map-core';
import type { MapEventType } from 'maplibre-gl';
import { getMap } from '../../../store/store';
import { useMapMittStore } from '../../mitt';
import { logger, useMapEventStore } from '../store';

export function useEventMap(
  mapId: string,
  event: AnyIEvent,
  immediate = false,
) {
  const store = useMapEventStore(mapId);
  const emitter = useMapMittStore<MittTypeMapEvent>(mapId);
  const eventRef = useRef(event);
  eventRef.current = event;

  const manager = useMemo(
    () =>
      new EventManager(
        mapId,
        store,
        emitter,
        (id, level, msg, data) => {
          logHelper(logger, id, 'hook', 'useEventMap')[level](msg, data);
        },
      ),
    [mapId, store, emitter],
  );

  const [isActive, setIsActive] = useState(() =>
    manager.isActive(event.id),
  );

  const add = useCallback(() => {
    manager.add(eventRef.current, 'react');
  }, [manager]);

  const remove = useCallback(() => {
    manager.remove(eventRef.current);
  }, [manager]);

  useEffect(() => {
    const update = () => setIsActive(manager.isActive(eventRef.current.id));
    emitter.on(MittTypeMapEventEventKey.setCurrent, update);
    emitter.on(MittTypeMapEventEventKey.add, update);
    emitter.on(MittTypeMapEventEventKey.remove, update);
    update();
    return () => {
      emitter.off(MittTypeMapEventEventKey.setCurrent, update);
      emitter.off(MittTypeMapEventEventKey.add, update);
      emitter.off(MittTypeMapEventEventKey.remove, update);
    };
  }, [emitter, manager, event.id]);

  useEffect(() => {
    const current = event;
    if (immediate) manager.add(current, 'react');
    return () => manager.remove(current);
  }, [mapId, event, immediate, manager]);

  return { add, remove, isActive };
}

type KnownMapEvent = keyof MapEventType;
export function useEventListener<K extends KnownMapEvent>(
  mapId: string,
  event: K,
  cb: (map: MapSimple, ev: MapEventType[K] & object) => void,
  immediate = true,
): { add: () => void; remove: () => void } {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  const wrappedCb = useRef<
    Record<string, ((ev: MapEventType[K]) => void) | undefined>
  >({});

  const add = useCallback(() => {
    getMap(mapId, (map) => {
      const eventHandle = (ev: MapEventType[K]) => cbRef.current(map, ev);
      wrappedCb.current[map.id] = eventHandle;
      map.on(event, eventHandle);
    });
  }, [mapId, event]);

  const remove = useCallback(() => {
    getMap(mapId, (map) => {
      const eventHandle = wrappedCb.current[map.id];
      if (eventHandle) map.off(event, eventHandle);
    });
  }, [mapId, event]);

  useEffect(() => {
    if (immediate) add();
    return () => remove();
  }, [mapId, event, immediate, add, remove]);
  return { add, remove };
}
