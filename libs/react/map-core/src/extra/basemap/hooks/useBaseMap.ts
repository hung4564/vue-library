import type { BaseMapItem, MittTypeBaseMap } from '@hungpvq/map-core';
import {
  BasemapManager,
  logHelper,
  MittTypeBaseMapEventKey,
} from '@hungpvq/map-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMapMittStore } from '../../mitt';
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

  const [baseMaps, setBaseMapsState] = useState<BaseMapItem[]>(
    manager.getBaseMaps(),
  );
  const [currentBaseMap, setCurrentBaseMapState] = useState<
    BaseMapItem | undefined
  >(manager.getCurrent());

  const updateBaseMapsHandler = useCallback((p_baseMaps: BaseMapItem[]) => {
    setBaseMapsState(p_baseMaps);
    // Handler chỉ cập nhật React state - setDefaultBaseMap đã được gọi trong init ngay sau setBaseMaps
  }, []);

  const updateCurrentBaseMapHandler = useCallback(
    (baseMap: BaseMapItem | undefined) => {
      setCurrentBaseMapState(baseMap);
    },
    [],
  );

  useEffect(() => {
    emitter.on(MittTypeBaseMapEventKey.set, updateBaseMapsHandler);
    emitter.on(MittTypeBaseMapEventKey.setCurrent, updateCurrentBaseMapHandler);
    return () => {
      emitter.off(MittTypeBaseMapEventKey.set, updateBaseMapsHandler);
      emitter.off(
        MittTypeBaseMapEventKey.setCurrent,
        updateCurrentBaseMapHandler,
      );
    };
  }, [emitter, updateBaseMapsHandler, updateCurrentBaseMapHandler]);

  const remove = useCallback(() => {
    emitter.off(MittTypeBaseMapEventKey.set, updateBaseMapsHandler);
    emitter.off(
      MittTypeBaseMapEventKey.setCurrent,
      updateCurrentBaseMapHandler,
    );
  }, [emitter, updateBaseMapsHandler, updateCurrentBaseMapHandler]);

  return {
    baseMaps,
    currentBaseMap,

    setBaseMaps: (items: BaseMapItem[]) => manager.setBaseMaps(items),
    setDefaultBaseMap: (defaultBaseMap?: string) =>
      manager.setDefaultBaseMap(defaultBaseMap),
    setCurrent: (baseMap: BaseMapItem) => manager.setCurrent(baseMap),
    init: (baseMaps: BaseMapItem[], defaultBaseMap?: string) =>
      manager.init(baseMaps, defaultBaseMap),

    remove,
  };
}
