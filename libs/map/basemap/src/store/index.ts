import { addStore, addToQueue, getStore } from '@hungpvq/vue-map-core';
import { BaseMapAdapter, DefaultBaseMapAdapter } from '../adapter/base';
import { BaseMapStore } from '../types';

const KEY = 'basemap';
export function initMapBaseMap(mapId: string) {
  addStore<BaseMapStore>(mapId, KEY, {
    baseMaps: [],
    defaultBaseMap: '',
    current: undefined,
    loading: false,
    adapter: new DefaultBaseMapAdapter(mapId),
  });
}
addToQueue(KEY, initMapBaseMap);

function getBaseMapStore(map_id: string): BaseMapStore {
  return getStore<BaseMapStore>(map_id, KEY);
}
export function setBaseMapAdapter(
  mapId: string,
  adapter: (mapId: string) => BaseMapAdapter,
) {
  getBaseMapStore(mapId).adapter = adapter(mapId);
}
