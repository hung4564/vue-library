import type { BaseMapItem, MittTypeBaseMap } from '@hungpvq/map-core/basemap';
import { logHelper } from '@hungpvq/map-core';
import {
  BasemapManager,
  subscribeBasemapMirror,
} from '@hungpvq/map-core/basemap';
import { useMapMittStore } from '../../../extra/mitt';
import { onUnmounted, ref } from 'vue';
import { logger } from '../logger';
import { useMapBaseMapStore } from '../store';

export function useBaseMap(mapId: string) {
  const state = useMapBaseMapStore(mapId);
  const emitter = useMapMittStore<MittTypeBaseMap>(mapId);

  const manager = new BasemapManager(
    mapId,
    state,
    state.adapter,
    emitter,
    (mapIdParam, level, message, data) => {
      logHelper(logger, mapIdParam, 'hook', 'useBaseMap')[level](message, data);
    },
  );

  const baseMaps = ref<BaseMapItem[]>(manager.getBaseMaps());
  const currentBaseMap = ref<BaseMapItem | undefined>(manager.getCurrent());

  const remove = subscribeBasemapMirror(emitter, {
    onBaseMaps: (items) => {
      baseMaps.value = items;
    },
    onCurrent: (baseMap) => {
      currentBaseMap.value = baseMap;
    },
  });

  onUnmounted(() => {
    remove();
  });

  return {
    baseMaps,
    currentBaseMap,
    setBaseMaps: (items: BaseMapItem[]) => manager.setBaseMaps(items),
    setDefaultBaseMap: (defaultBaseMap?: string) =>
      manager.setDefaultBaseMap(defaultBaseMap),
    setCurrent: (baseMap: BaseMapItem) => manager.setCurrent(baseMap),
    init: (items: BaseMapItem[], defaultBaseMap?: string) =>
      manager.init(items, defaultBaseMap),
    remove,
  };
}
