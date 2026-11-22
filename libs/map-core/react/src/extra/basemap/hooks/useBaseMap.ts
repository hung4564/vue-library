import { logHelper } from '@hungpvq/map-core';
import {
  type BaseMapItem,
  getOrCreateBasemapManager,
  logger,
  MittTypeBaseMap,
  subscribeBasemapMirror,
} from '@hungpvq/map-core/basemap';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useMapMittStore } from '../../../store/mitt-store';
import { useMapBaseMapStore } from '../store';

function basemapHookLogger(
  mapIdParam: string,
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  data?: unknown,
) {
  const fn =
    typeof message === 'string' && message.length > 0 ? message : 'useBaseMap';
  logHelper(logger, mapIdParam, 'hook', 'useBaseMap')
    .with({
      fn,
      span: `hook.${fn}`,
    })
    [level](message, data);
}

export function useBaseMap(mapId: string) {
  const state = useMapBaseMapStore(mapId);
  const emitter = useMapMittStore<MittTypeBaseMap>(mapId);
  const manager = getOrCreateBasemapManager(
    mapId,
    state,
    emitter,
    basemapHookLogger,
  );

  const unsubRef = useRef<(() => void) | null>(null);
  const [baseMaps, setBaseMapsState] = useState<BaseMapItem[]>(
    manager.getBaseMaps(),
  );
  const [currentBaseMap, setCurrentBaseMapState] = useState<
    BaseMapItem | undefined
  >(manager.getCurrent());
  const [opacity, setOpacityState] = useState(manager.getOpacity());

  useEffect(() => {
    setBaseMapsState(manager.getBaseMaps());
    setCurrentBaseMapState(manager.getCurrent());
    setOpacityState(manager.getOpacity());
    const unsub = subscribeBasemapMirror(emitter, {
      onBaseMaps: setBaseMapsState,
      onCurrent: setCurrentBaseMapState,
      onOpacity: setOpacityState,
    });
    unsubRef.current = unsub;
    return () => {
      unsub();
      unsubRef.current = null;
    };
  }, [emitter, manager]);

  const setBaseMaps = useCallback(
    (items: BaseMapItem[]) => manager.setBaseMaps(items),
    [manager],
  );
  const setDefaultBaseMap = useCallback(
    (defaultBaseMap?: string) => manager.setDefaultBaseMap(defaultBaseMap),
    [manager],
  );
  const setCurrent = useCallback(
    (baseMap: BaseMapItem) => manager.setCurrent(baseMap),
    [manager],
  );
  const setOpacity = useCallback(
    (value: number) => manager.setOpacity(value),
    [manager],
  );
  const addBaseMap = useCallback(
    (item: BaseMapItem) => manager.addBaseMap(item),
    [manager],
  );
  const removeBaseMap = useCallback(
    (id: string | number) => manager.removeBaseMap(id),
    [manager],
  );
  const init = useCallback(
    (items: BaseMapItem[], defaultBaseMap?: string) =>
      manager.init(items, defaultBaseMap),
    [manager],
  );
  const remove = useCallback(() => {
    unsubRef.current?.();
    unsubRef.current = null;
  }, []);

  return {
    baseMaps,
    currentBaseMap,
    opacity,
    setBaseMaps,
    setDefaultBaseMap,
    setCurrent,
    setOpacity,
    addBaseMap,
    removeBaseMap,
    init,
    remove,
  };
}
