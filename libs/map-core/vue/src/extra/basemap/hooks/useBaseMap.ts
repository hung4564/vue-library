import { logHelper } from '@hungpvq/map-core';
import {
  type BaseMapItem,
  getOrCreateBasemapManager,
  logger,
  MittTypeBaseMap,
  subscribeBasemapMirror,
} from '@hungpvq/map-core/basemap';
import { onUnmounted, ref } from 'vue';

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

  const baseMaps = ref<BaseMapItem[]>(manager.getBaseMaps());
  const currentBaseMap = ref<BaseMapItem | undefined>(manager.getCurrent());
  const opacity = ref(manager.getOpacity());

  const remove = subscribeBasemapMirror(emitter, {
    onBaseMaps: (items) => {
      baseMaps.value = items;
    },
    onCurrent: (baseMap) => {
      currentBaseMap.value = baseMap;
    },
    onOpacity: (value) => {
      opacity.value = value;
    },
  });

  onUnmounted(remove);

  return {
    baseMaps,
    currentBaseMap,
    opacity,
    setBaseMaps: (items: BaseMapItem[]) => manager.setBaseMaps(items),
    setDefaultBaseMap: (defaultBaseMap?: string) =>
      manager.setDefaultBaseMap(defaultBaseMap),
    setCurrent: (baseMap: BaseMapItem) => manager.setCurrent(baseMap),
    setOpacity: (value: number) => manager.setOpacity(value),
    addBaseMap: (item: BaseMapItem) => manager.addBaseMap(item),
    removeBaseMap: (id: string | number) => manager.removeBaseMap(id),
    init: (items: BaseMapItem[], defaultBaseMap?: string) =>
      manager.init(items, defaultBaseMap),
    remove,
  };
}
