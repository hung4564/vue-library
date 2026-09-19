import { logHelper } from '@hungpvq/map-core';
import {
  type BaseMapItem,
  MittTypeBaseMap,
  getOrCreateBasemapManager,
  subscribeBasemapMirror,
  logger,
} from '@hungpvq/map-core/basemap';
import { useMapMittStore } from '../../../store/mitt-store';
import { onUnmounted, ref } from 'vue';
import { useMapBaseMapStore } from '../store';

function basemapHookLogger(
  mapIdParam: string,
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  data?: unknown,
) {
  const fn =
    typeof message === 'string' && message.length > 0 ? message : 'useBaseMap';
  logHelper(logger, mapIdParam, 'hook', 'useBaseMap').with({
    fn,
    span: `hook.${fn}`,
  })[level](message, data);
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

  const remove = subscribeBasemapMirror(emitter, {
    onBaseMaps: (items) => {
      baseMaps.value = items;
    },
    onCurrent: (baseMap) => {
      currentBaseMap.value = baseMap;
    },
  });

  onUnmounted(remove);

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
