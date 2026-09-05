import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

type ReactComponentType = {
  displayName?: string;
  name?: string;
  type?: ReactComponentType | string;
  render?: ReactComponentType;
};

type ReactOwnerFiber = {
  type?: ReactComponentType | string;
};

/** Resolve calling component name (Vue `getCurrentInstance` parity). */
export function useComponentName(fallback = 'unknown-component'): string {
  const nameRef = useRef<string | null>(null);
  if (nameRef.current == null) {
    nameRef.current =
      resolveReactOwnerName() ?? resolveNameFromStack() ?? fallback;
  }
  return nameRef.current;
}

function getTypeName(
  type: ReactComponentType | string | undefined,
): string | undefined {
  if (!type) return undefined;
  if (typeof type === 'string') return type || undefined;
  if (type.displayName) return type.displayName;
  if (type.name) return type.name;
  // memo / forwardRef
  if (type.type) return getTypeName(type.type);
  if (type.render) return getTypeName(type.render);
  return undefined;
}

function resolveReactOwnerName(): string | undefined {
  try {
    const internals = (
      React as unknown as {
        __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?: {
          ReactCurrentOwner?: { current?: ReactOwnerFiber | null };
        };
      }
    ).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

    return getTypeName(internals?.ReactCurrentOwner?.current?.type);
  } catch {
    return undefined;
  }
}

function resolveNameFromStack(): string | undefined {
  try {
    const stack = new Error().stack ?? '';
    const skip = new Set([
      'useComponentName',
      'useEventMap',
      'resolveNameFromStack',
      'resolveReactOwnerName',
      'getTypeName',
    ]);
    for (const line of stack.split('\n')) {
      const match =
        line.match(/at ([A-Z][\w$]*)\b/) ||
        line.match(/at Object\.([A-Z][\w$]*)\b/);
      if (!match) continue;
      const name = match[1];
      if (skip.has(name) || name.startsWith('use')) continue;
      return name;
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

export function useEventMap(
  mapId: string,
  event: AnyIEvent,
  immediate = false,
  from?: string,
) {
  const store = useMapEventStore(mapId);
  const emitter = useMapMittStore<MittTypeMapEvent>(mapId);
  const detectedName = useComponentName();
  const componentName = from || detectedName;
  const eventRef = useRef(event);
  eventRef.current = event;
  const componentNameRef = useRef(componentName);
  componentNameRef.current = componentName;

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
    manager.add(eventRef.current, componentNameRef.current);
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
    if (immediate) manager.add(current, componentNameRef.current);
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
