import type { BaseMapItem, MittTypeBaseMap } from '@hungpvq/map-core';
import {
  BasemapManager,
  logHelper,
  MittTypeBaseMapEventKey,
} from '@hungpvq/map-core';
import { useMapMittStore } from '../../../extra/mitt';
import { onUnmounted, ref } from 'vue';
import { logger } from '../logger';
import { useMapBaseMapStore } from '../store';

export function useBaseMap(mapId: string) {
  const state = useMapBaseMapStore(mapId);
  const emitter = useMapMittStore<MittTypeBaseMap>(mapId);

  // Create BasemapManager instance (core is single source of truth)
  const manager = new BasemapManager(
    mapId,
    state,
    state.adapter,
    emitter,
    (mapIdParam, level, message, data) => {
      logHelper(logger, mapIdParam, 'hook', 'useBaseMap')[level](message, data);
    },
  );

  // Vue reactive state - mirror from core state
  const baseMaps = ref<BaseMapItem[]>(manager.getBaseMaps());
  const currentBaseMap = ref<BaseMapItem | undefined>(manager.getCurrent());

  // Subscribe to events and mirror state
  const updateBaseMapsHandler = (p_baseMaps: BaseMapItem[]) => {
    baseMaps.value = p_baseMaps;
    // Re-apply default if needed
    manager.setDefaultBaseMap(state.defaultBaseMap);
  };

  const updateCurrentBaseMapHandler = (baseMap: BaseMapItem | undefined) => {
    currentBaseMap.value = baseMap;
  };

  emitter.on(MittTypeBaseMapEventKey.set, updateBaseMapsHandler);
  emitter.on(MittTypeBaseMapEventKey.setCurrent, updateCurrentBaseMapHandler);

  const remove = () => {
    emitter.off(MittTypeBaseMapEventKey.set, updateBaseMapsHandler);
    emitter.off(
      MittTypeBaseMapEventKey.setCurrent,
      updateCurrentBaseMapHandler,
    );
  };

  onUnmounted(() => {
    remove();
  });

  return {
    // Vue reactive state (mirrored from core)
    baseMaps,
    currentBaseMap,

    // Methods that delegate to core manager
    setBaseMaps: (items: BaseMapItem[]) => manager.setBaseMaps(items),
    setDefaultBaseMap: (defaultBaseMap?: string) =>
      manager.setDefaultBaseMap(defaultBaseMap),
    setCurrent: (baseMap: BaseMapItem) => manager.setCurrent(baseMap),
    init: (baseMaps: BaseMapItem[], defaultBaseMap?: string) =>
      manager.init(baseMaps, defaultBaseMap),

    // Cleanup
    remove,
  };
}
