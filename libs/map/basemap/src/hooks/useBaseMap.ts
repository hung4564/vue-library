import type { BaseMapItem, MittTypeBaseMap } from '@hungpvq/map-core';
import {
  BasemapService,
  logHelper,
  MittTypeBaseMapEventKey,
} from '@hungpvq/map-core';
import { useMapMittStore } from '@hungpvq/vue-map-core';
import { onUnmounted, ref } from 'vue';
import { logger } from '../logger';
import { useMapBaseMapStore } from '../store';

export function useBaseMap(mapId: string) {
  const state = useMapBaseMapStore(mapId);
  const emitter = useMapMittStore<MittTypeBaseMap>(mapId);

  function setBaseMaps(baseMaps: BaseMapItem[]) {
    logHelper(logger, mapId, 'hook', 'useBaseMap').debug(
      'setBaseMaps',
      baseMaps,
    );
    state.baseMaps = baseMaps;
    emitter.emit(MittTypeBaseMapEventKey.set, baseMaps);
  }

  function setDefaultBaseMap(defaultBaseMap?: string) {
    logHelper(logger, mapId, 'hook', 'useBaseMap').debug(
      'setDefaultBaseMap',
      defaultBaseMap,
    );
    state.defaultBaseMap = defaultBaseMap || '';
    const baseMap = BasemapService.getDefaultBasemap(
      state.baseMaps,
      state.defaultBaseMap,
      state.adapter,
    );
    if (!state.current && baseMap) setCurrent(baseMap);
  }

  async function setCurrent(baseMap: BaseMapItem) {
    logHelper(logger, mapId, 'hook', 'useBaseMap').debug('setCurrent', baseMap);
    if (state.loading) return;
    try {
      state.current = baseMap;
      emitter.emit(MittTypeBaseMapEventKey.setCurrent, state.current);
      state.loading = true;
      await BasemapService.switchBasemap(mapId, state.adapter, baseMap);
      state.loading = false;
    } finally {
      state.loading = false;
    }
  }

  const baseMaps = ref<BaseMapItem[]>(state.baseMaps);
  const currentBaseMap = ref<BaseMapItem | undefined>(state.current);

  const updateBaseMapsHandler = (p_baseMaps: BaseMapItem[]) => {
    baseMaps.value = p_baseMaps;
    setDefaultBaseMap(state.defaultBaseMap);
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

  const init = (baseMaps: BaseMapItem[], defaultBaseMap?: string) => {
    logHelper(logger, mapId, 'hook', 'useBaseMap').debug(
      'init',
      baseMaps,
      defaultBaseMap,
    );
    setDefaultBaseMap(defaultBaseMap);
    setBaseMaps(baseMaps);
  };

  return {
    setBaseMaps,
    baseMaps,
    setDefaultBaseMap,
    setCurrent,
    currentBaseMap,
    remove,
    init,
  };
}
