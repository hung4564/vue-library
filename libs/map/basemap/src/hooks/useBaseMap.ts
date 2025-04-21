import type { MapSimple } from '@hungpvq/shared-map';
import { addStore, getStore, store } from '@hungpvq/vue-map-core';
import { computed, reactive } from 'vue';
import { BaseMapItem, BaseMapStore } from '../types';
import { BaseMapLayer } from './model';
const KEY = 'basemap';
export function useBaseMap(mapId: string) {
  const state = addStore(
    mapId,
    KEY,
    reactive({
      baseMaps: [],
      defaultBaseMap: '',
      current: undefined,
      layer: undefined,
      loading: false,
    })
  ) as BaseMapStore;
  function setBaseMaps(baseMaps: BaseMapItem[]) {
    state.baseMaps = baseMaps;
  }
  function setDefaultBaseMap(defaultBaseMap: string) {
    state.defaultBaseMap = defaultBaseMap;
    if (!state.current) setCurrent(getIndexDefault(mapId));
  }
  function setCurrent(baseMap: BaseMapItem) {
    state.current = baseMap;
    setBaseMapForMap(mapId, state.current);
  }
  const baseMaps = computed(() => {
    return state.baseMaps;
  });
  const currentBaseMap = computed(() => {
    return state.current;
  });
  return {
    setBaseMaps,
    baseMaps,
    setDefaultBaseMap,
    setCurrent,
    currentBaseMap,
  };
}

function getIndexDefault(mapId: string): BaseMapItem {
  const state = getStore<BaseMapStore>(mapId, KEY);
  const defaultIndexBaseMap = state.baseMaps.findIndex(
    (b) => b.default || b.title === state.defaultBaseMap
  );
  const index = defaultIndexBaseMap < 0 ? 0 : defaultIndexBaseMap;
  return state.baseMaps[index];
}
function getLowestLayerId(map: MapSimple) {
  const layers = map.getStyle().layers;

  return layers.length > 0 ? layers[0].id : undefined;
}

export function clearBaseMapForMap(mapId: string) {
  const state = getStore<BaseMapStore>(mapId, KEY);
  const layer = state.layer;
  if (!layer) {
    return;
  }
  store.actions.getMap(mapId, (map: MapSimple) => {
    layer.removeFromMap(map);
  });
}

export const setBaseMapForMap = async (mapId: string, item: BaseMapItem) => {
  if (!item) return;
  const state = getStore<BaseMapStore>(mapId, KEY);
  if (state.loading) return;
  state.current = item;
  state.loading = true;
  const metadata = {
    loading: false,
  };
  metadata.loading = true;
  let layer = state.layer;
  if (!layer) {
    state.layer = new BaseMapLayer();
    layer = state.layer;
  }
  metadata.loading = true;
  store.actions.getMap(mapId, (map: MapSimple) => {
    layer.removeFromMap(map);
  });
  await layer.setBaseMap(item);
  store.actions.getMap(mapId, (map: MapSimple) => {
    layer.addToMap(map, getLowestLayerId(map));
  });
  state.loading = false;
  metadata.loading = false;
};
