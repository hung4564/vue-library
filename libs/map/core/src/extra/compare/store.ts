import { Ref, ref } from 'vue';
import { addStore, getStore } from '../../store';

const KEY = 'map-compare';
export type MapLocateStore = {
  setting: Ref<{ compare?: boolean; split?: boolean; sync?: boolean }>;
};

export function initStoreMapCompare(mapId: string) {
  addStore<MapLocateStore>(mapId, KEY, {
    setting: ref({
      compare: true,
      split: true,
      sync: true,
    }),
  });
}

export function getMapCompare(mapId: string) {
  const store = getStore<MapLocateStore>(mapId, KEY);
  if (!store) {
    initStoreMapCompare(mapId);
    return getStore<MapLocateStore>(mapId, KEY);
  }
  return store;
}

export function getMapCompareSetting(mapId: string) {
  const store = getMapCompare(mapId);
  return store.setting;
}
