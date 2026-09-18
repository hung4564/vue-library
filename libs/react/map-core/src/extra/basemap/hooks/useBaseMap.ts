import type { BaseMapItem, MittTypeBaseMap } from '@hungpvq/map-core/basemap';
import { logHelper } from '@hungpvq/map-core';
import {
  BasemapManager,
  subscribeBasemapMirror,
} from '@hungpvq/map-core/basemap';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMapMittStore } from '../../../store/mitt-store';
import { logger } from '../logger';
import { useMapBaseMapStore } from '../store';

export function useBaseMap(mapId: string) {
  const state = useMapBaseMapStore(mapId);
  const emitter = useMapMittStore<MittTypeBaseMap>(mapId);

  const managerRef = useRef<BasemapManager | null>(null);
  if (!managerRef.current) {
    managerRef.current = new BasemapManager(
      mapId,
      state,
      state.adapter,
      emitter,
      (mapIdParam, level, message, data) => {
        logHelper(logger, mapIdParam, 'hook', 'useBaseMap')[level](
          message,
          data,
        );
      },
    );
  }
  const manager = managerRef.current;
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const [baseMaps, setBaseMapsState] = useState<BaseMapItem[]>(
    manager.getBaseMaps(),
  );
  const [currentBaseMap, setCurrentBaseMapState] = useState<
    BaseMapItem | undefined
  >(manager.getCurrent());

  useEffect(() => {
    setBaseMapsState(manager.getBaseMaps());
    setCurrentBaseMapState(manager.getCurrent());

    unsubscribeRef.current = subscribeBasemapMirror(emitter, {
      onBaseMaps: setBaseMapsState,
      onCurrent: setCurrentBaseMapState,
    });
    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
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
  const init = useCallback(
    (items: BaseMapItem[], defaultBaseMap?: string) =>
      manager.init(items, defaultBaseMap),
    [manager],
  );
  const remove = useCallback(() => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
  }, []);

  return {
    baseMaps,
    currentBaseMap,
    setBaseMaps,
    setDefaultBaseMap,
    setCurrent,
    init,
    remove,
  };
}
