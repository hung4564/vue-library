import type { MapSimple } from '@hungpvq/shared-map';
import {
  ILayer,
  IView,
  addStore,
  addToQueue,
  getStore,
  store as storeMap,
} from '@hungpvq/vue-map-core';
import { ref, type Ref } from 'vue';

export const KEY = 'layer';
export type MapLayerStore = {
  layers: Record<string, ILayer>;
  layerIds: Ref<string[]>;
};
export function initMapLayer(mapId: string) {
  addStore<MapLayerStore>(mapId, KEY, { layers: {}, layerIds: ref([]) });
}
addToQueue(KEY, initMapLayer);

export async function addLayer(mapId: string, layer: ILayer) {
  const store = getStore<MapLayerStore>(mapId, KEY);
  store.layers[layer.id] = layer;
  store.layerIds.value.push(layer.id);
  const listView = layer.getView('list');
  if (listView) {
    listView.index = store.layerIds.value.length;
  }
  storeMap.actions.getMap(mapId, async (map) => {
    layer.addToMap(map);
  });
}
export function removeLayer(mapId: string, layer: ILayer) {
  const store = getStore<MapLayerStore>(mapId, KEY);
  storeMap.actions.getMap(mapId, async (map: MapSimple) => {
    layer.removeFromMap(map);
  });
  delete store.layers[layer.id];
  store.layerIds.value = store.layerIds.value.filter((x) => x != layer.id);
}
export function getStoreLayer(mapId: string) {
  const store = getStore<MapLayerStore>(mapId, KEY);
  return store;
}
export function getAllLayersByView<T extends IView = IView>(
  mapId: string,
  key: string
) {
  const store = getStore<MapLayerStore>(mapId, KEY);
  const views: T[] = [];
  store.layerIds.value.forEach((layer_id) => {
    const layer = store.layers[layer_id];
    if (layer) {
      const view = layer.getView(key) as T;
      if (view) views.push(view);
    }
  });
  return views;
}

export function getLayerIds(mapId: string) {
  const store = getStore<MapLayerStore>(mapId, KEY);
  return store.layerIds;
}
